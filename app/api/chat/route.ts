import { ollama } from "ollama-ai-provider";
import { convertToCoreMessages, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { defaultLocalPrompt, defaultExternalPrompt } from "@/app/lib/prompts";
import { MindMapData, MindMapNode } from "@/app/components/MindMap";

const validateLinks = async (node: MindMapNode): Promise<MindMapNode> => {
  if (node.links) {
    const validatedLinks = await Promise.all(
      node.links.map(async (link) => {
        try {
          const response = await fetch(link.url, { method: "HEAD" });
          return response.ok ? link : null;
        } catch {
          return null;
        }
      })
    );
    node.links = validatedLinks.filter(
      (link): link is NonNullable<typeof link> => link !== null
    );
  }

  if (node.nodes) {
    node.nodes = await Promise.all(node.nodes.map(validateLinks));
  }

  return node;
};

export async function POST(req: Request) {
  const { topic } = await req.json();
  const shouldUseLocalModels =
    process.env.NEXT_PUBLIC_USE_LOCAL_MODELS === "true";
  const model = shouldUseLocalModels
    ? ollama("llama3.1")
    : openai("gpt-3.5-turbo");

  const result = await generateText({
    model,
    messages: convertToCoreMessages([
      {
        role: "user",
        content: shouldUseLocalModels
          ? defaultLocalPrompt + topic
          : defaultExternalPrompt + topic,
      },
    ]),
  });

  try {
    const mindMapData: MindMapData = JSON.parse(result.text);
    mindMapData.nodes = await Promise.all(mindMapData.nodes.map(validateLinks));
    return new Response(JSON.stringify(mindMapData));
  } catch (error) {
    console.error("Error parsing or validating mind map data:", error);
    return new Response("Error generating mind map", { status: 500 });
  }
}
