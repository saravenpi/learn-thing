import { MindMapData, MindMapNode } from "@/app/components/MindMap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const convertToMarkdown = (data: MindMapData): string => {
  let markdown = `# ${data.title}\n\n${data.description}\n\n`;

  const processNode = (node: MindMapNode, depth: number) => {
    const prefix = "#".repeat(depth + 1);
    markdown += `${prefix} ${node.title}\n\n${node.description}\n\n`;

    if (node.details) {
      markdown += `${node.details}\n\n`;
    }

    if (node.links && node.links.length > 0) {
      markdown += "Learn More:\n";
      node.links.forEach((link) => {
        markdown += `- [${link.title}](${link.url})\n`;
      });
      markdown += "\n";
    }

    if (node.nodes && node.nodes.length > 0) {
      node.nodes.forEach((childNode) => processNode(childNode, depth + 1));
    }
  };

  data.nodes.forEach((node) => processNode(node, 1));

  return markdown;
};

export function downloadJson(data: MindMapData, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
