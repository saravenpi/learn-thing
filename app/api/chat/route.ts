import { ollama } from "ollama-ai-provider";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { defaultLocalPrompt, defaultExternalPrompt } from "@/app/lib/prompts";

import {
  FlatMindMapSchema,
  FlatSubtopicSchema,
  Subtopic,
} from "@/app/lib/schemas";
import { validateMindMapData } from "@/lib/utils";
import { z } from "zod";

const USE_LOCAL_MODELS = process.env.NEXT_PUBLIC_USE_LOCAL_MODELS === "true";
const LOCAL_MODEL = "llama3.1";
const EXTERNAL_MODEL = "gpt-4o";

const getModel = (useLocalModel: boolean) =>
  useLocalModel
    ? ollama(LOCAL_MODEL)
    : openai(EXTERNAL_MODEL, { structuredOutputs: true });

const getPrompt = (useLocalModel: boolean, topic: string) =>
  (useLocalModel ? defaultLocalPrompt : defaultExternalPrompt) + topic;

export async function POST(req: Request) {
  const { topic } = await req.json();

  try {
    const model = getModel(USE_LOCAL_MODELS);
    const prompt = getPrompt(USE_LOCAL_MODELS, topic);

    const { object: flatMindMapData } = await generateObject({
      model,
      prompt,
      schema: FlatMindMapSchema,
    });

    const nestedMindMapData = {
      topic: flatMindMapData.topic,
      subtopics: reconstructNestedStructure(flatMindMapData.subtopics),
    };

    const validatedMindMapData = await validateMindMapData(nestedMindMapData);

    return new Response(JSON.stringify(validatedMindMapData));
  } catch (error) {
    console.error("Error generating or processing mind map:", error);
    return new Response("Error generating mind map", { status: 500 });
  }
}

function reconstructNestedStructure(
  flatSubtopics: z.infer<typeof FlatSubtopicSchema>[]
): Subtopic[] {
  const subtopicMap = new Map<string, Subtopic>();
  const rootSubtopics: Subtopic[] = [];

  flatSubtopics.forEach((subtopic) => {
    subtopicMap.set(subtopic.id, {
      name: subtopic.name,
      details: subtopic.details,
      links: subtopic.links,
      subtopics: [],
    });
  });

  flatSubtopics.forEach((subtopic) => {
    const reconstructedSubtopic = subtopicMap.get(subtopic.id);
    if (reconstructedSubtopic) {
      if (subtopic.parentId === null) {
        rootSubtopics.push(reconstructedSubtopic);
      } else {
        const parent = subtopicMap.get(subtopic.parentId);
        if (parent && parent.subtopics) {
          parent.subtopics.push(reconstructedSubtopic);
        }
      }
    }
  });

  return rootSubtopics;
}
