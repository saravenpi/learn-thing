import { ollama } from "ollama-ai-provider";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { defaultLocalPrompt, defaultExternalPrompt } from "@/app/lib/prompts";

import {
  FlatMindMapSchema,
  FlatSubtopicSchema,
  Subtopic,
} from "@/app/lib/schemas";
import { validateMindMapData } from "@/lib/utils";
import { z } from "zod";

interface ParsedSubtopic {
  name: string;
  details: string;
  links: { type: string; title: string; url: string; }[];
}

interface ParsedResponse {
  topic?: string;
  subtopics: ParsedSubtopic[];
}

interface NodeWithHierarchy {
  name: string;
  details: string;
  links: { type: string; title: string; url: string; }[];
  subtopics: NodeWithHierarchy[];
  id: string;
  parentId: string | null;
}

const USE_LOCAL_MODELS = process.env.NEXT_PUBLIC_USE_LOCAL_MODELS === "true";
const LOCAL_MODEL = "llama3.1";
const EXTERNAL_MODEL = "gpt-4o";

const getModel = (useLocalModel: boolean) =>
  useLocalModel
    ? ollama(LOCAL_MODEL)
    : openai(EXTERNAL_MODEL, { structuredOutputs: true });

const getPrompt = (useLocalModel: boolean, topic: string, nodeId?: string) => {
  const basePrompt = useLocalModel ? defaultLocalPrompt : defaultExternalPrompt;
  if (nodeId) {
    return `${basePrompt}Expand the subtopic "${topic}" with node ID "${nodeId}".`;
  }
  return `${basePrompt}${topic}`;
};

export async function POST(req: Request) {
  const { topic, nodeId } = await req.json();

  try {
    const model = getModel(USE_LOCAL_MODELS);
    const prompt = getPrompt(USE_LOCAL_MODELS, topic, nodeId);

    const generateMindMap = async (): Promise<
      z.infer<typeof FlatMindMapSchema>
    > => {
      if (USE_LOCAL_MODELS) {
        const response = await generateText({ model, prompt });

        try {
          const cleanedResponse = response.text.trim();
          const lastBrace = cleanedResponse.lastIndexOf("}");
          const validJson = cleanedResponse.substring(0, lastBrace + 1);
          const parsedResponse = JSON.parse(validJson) as ParsedResponse;

          if (nodeId) {
            const subtopics = parsedResponse.subtopics.map((st: ParsedSubtopic) => ({
              id: `${nodeId}-${st.name.replace(/\s+/g, "-")}`,
              parentId: nodeId,
              name: st.name,
              details: st.details,
              links: st.links || [],
            }));

            return {
              topic,
              subtopics,
            };
          }

          return {
            topic: parsedResponse.topic || topic,
            subtopics: parsedResponse.subtopics.map((st) => ({
              id: st.name.replace(/\s+/g, "-"),
              parentId: null,
              name: st.name,
              details: st.details,
              links: st.links || [],
            })),
          };
        } catch (parseError) {
          console.error("Failed to parse model response:", parseError);
          return {
            topic,
            subtopics: [
              {
                id: nodeId || "error",
                parentId: null,
                name: "Error expanding topic",
                details: "Failed to expand this topic. Please try again.",
                links: [],
              },
            ],
          };
        }
      }

      const { object } = await generateObject({
        model,
        prompt,
        schema: FlatMindMapSchema,
      });
      return object;
    };

    const flatMindMapData = await generateMindMap();

    if (!flatMindMapData || !flatMindMapData.subtopics) {
      throw new Error("Invalid mind map data structure");
    }

    const nestedMindMapData = {
      topic: flatMindMapData.topic,
      subtopics: reconstructNestedStructure(flatMindMapData.subtopics),
    };

    const validatedMindMapData = await validateMindMapData(nestedMindMapData);

    return new Response(JSON.stringify(validatedMindMapData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    const errorResponse = {
      topic,
      subtopics: [
        {
          name: "Error",
          details: "Failed to expand this topic. Please try again.",
          links: [],
          subtopics: [],
        },
      ],
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function reconstructNestedStructure(
  flatSubtopics: z.infer<typeof FlatSubtopicSchema>[]
): Subtopic[] {
  const subtopicMap = new Map<string, NodeWithHierarchy>();

  flatSubtopics.forEach((subtopic) => {
    subtopicMap.set(subtopic.id, {
      name: subtopic.name,
      details: subtopic.details,
      links: subtopic.links,
      subtopics: [],
      id: subtopic.id,
      parentId: subtopic.parentId,
    });
  });

  const rootNodes: NodeWithHierarchy[] = [];
  flatSubtopics.forEach((subtopic) => {
    const node = subtopicMap.get(subtopic.id);
    if (!node) return;

    if (!subtopic.parentId) {
      rootNodes.push(node);
      return;
    }

    const parent = subtopicMap.get(subtopic.parentId);
    if (!parent) {
      rootNodes.push(node);
      return;
    }

    parent.subtopics.push(node);
  });

  const cleanNode = (node: NodeWithHierarchy): Subtopic => {
    const { id: _id, parentId: _parentId, ...cleanedNode } = node;
    return {
      ...cleanedNode,
      subtopics: node.subtopics.map(cleanNode),
    };
  };

  return rootNodes.map(cleanNode);
}
