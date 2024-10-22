"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MiniMap,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, PlusSquare } from "lucide-react";
import { convertToMarkdown, downloadJson } from "@/lib/utils";
import MindMapLegend from "./MindMapLegend";
import { motion, AnimatePresence } from "framer-motion";
import Credits from "./Credits";

interface Link {
  title: string;
  url: string;
}

export interface MindMapNode {
  title: string;
  description: string;
  details?: string;
  links?: Link[];
  order: number;
  nodes: MindMapNode[];
}

export interface MindMapData {
  title: string;
  description: string;
  nodes: MindMapNode[];
}

const NodeContent: React.FC<{
  title: string;
  description: string;
  details?: string;
  onClick: () => void;
}> = ({ title, onClick }) => (
  <div
    className="p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out cursor-pointer w-48 bg-white hover:bg-gray-100"
    onClick={onClick}
  >
    <div className="text-lg font-bold text-center">{title}</div>
  </div>
);

const RootNode: React.FC<NodeProps> = ({ data }) => (
  <div className="border-2 border-blue-500 text-blue-800">
    <NodeContent {...data} />
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const BranchNode: React.FC<NodeProps> = ({ data }) => (
  <div className="border-2 border-green-500 text-green-800">
    <NodeContent {...data} />
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const LeafNode: React.FC<NodeProps> = ({ data }) => (
  <div className="border-2 border-yellow-500 text-yellow-800">
    <NodeContent {...data} />
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
  </div>
);

const createNodesAndEdges = (
  node: MindMapNode,
  parentId: string | null,
  x: number,
  y: number,
  level: number,
  horizontalSpacing: number,
  verticalSpacing: number
): { nodes: Node[]; edges: Edge[] } => {
  const nodeId = `${parentId ? `${parentId}-` : ""}${(node.title || "").replace(
    /\s+/g,
    "-"
  )}`;
  const nodeType =
    level === 0 ? "root" : node.nodes.length > 0 ? "branch" : "leaf";

  const newNode: Node = {
    id: nodeId,
    type: nodeType,
    position: { x, y },
    data: {
      title: node.title,
      description: node.description,
      details: node.details,
      links: node.links,
    },
  };

  let nodes: Node[] = [newNode];
  let edges: Edge[] = [];

  if (parentId) {
    edges.push({
      id: `${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: "smoothstep",
    });
  }

  if (node.nodes && node.nodes.length > 0) {
    const childrenCount = node.nodes.length;
    const totalWidth = childrenCount * horizontalSpacing;
    const startX = x - totalWidth / 2 + horizontalSpacing / 2;

    node.nodes.forEach((childNode, index) => {
      const childX = startX + index * horizontalSpacing;
      const childY = y + verticalSpacing;
      const { nodes: childNodes, edges: childEdges } = createNodesAndEdges(
        childNode,
        nodeId,
        childX,
        childY,
        level + 1,
        horizontalSpacing / 1.5,
        verticalSpacing
      );
      nodes = [...nodes, ...childNodes];
      edges = [...edges, ...childEdges];
    });
  }

  return { nodes, edges };
};

const MindMap: React.FC<{ data: MindMapData | null }> = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 110);

    return () => clearTimeout(timer);
  }, []);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    return createNodesAndEdges({ ...data, order: 0 }, null, 0, 0, 0, 600, 200);
  }, [data]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as MindMapNode);
  }, []);

  const nodeTypes = useMemo(
    () => ({
      root: RootNode,
      branch: BranchNode,
      leaf: LeafNode,
    }),
    []
  );

  const downloadMarkdown = () => {
    if (!data) return;
    const markdown = convertToMarkdown(data);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, "_")}_mind_map.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!data) return;
    downloadJson(data, `${data.title.replace(/\s+/g, "_")}_mind_map.json`);
  };

  if (!data) return null;

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ width: "100%", height: "100%" }}
          >
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex items-center gap-2 cursor-pointer"
              >
                <PlusSquare className="w-4 h-4" />
                New
              </Button>
              <Button
                onClick={downloadMarkdown}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Markdown
              </Button>
              <Button
                onClick={handleDownloadJson}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                JSON
              </Button>
            </div>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onInit={onInit}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
              elementsSelectable={true}
              nodesDraggable={false}
            >
              <Background color="#f0f0f0" gap={16} />
              <Controls showInteractive={false} />
              <MiniMap />
            </ReactFlow>
            <MindMapLegend />
            <Credits />
          </motion.div>
        )}
      </AnimatePresence>
      <Sheet open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl mt-4 font-bold">
              {selectedNode?.title}
            </SheetTitle>
            <SheetDescription className="mb-2 text-gray-700">
              {selectedNode?.description}
            </SheetDescription>
          </SheetHeader>
          {selectedNode?.details && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Details</h3>
              <p className="text-gray-700">{selectedNode.details}</p>
            </div>
          )}
          {selectedNode?.links && selectedNode.links.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Learn More</h3>
              <div className="space-y-2 mt-4">
                {selectedNode.links.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <span className="flex-shrink-0 w-6">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                      <span className="truncate">{link.title}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MindMap;
