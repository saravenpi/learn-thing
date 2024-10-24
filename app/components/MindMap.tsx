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
import {
  ExternalLink,
  Download,
  PlusSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { convertToMarkdown, downloadJson } from "@/lib/utils";
import MindMapLegend from "./MindMapLegend";
import { motion, AnimatePresence } from "framer-motion";
import Credits from "./Credits";
import { MindMapData, Subtopic, Link } from "@/app/lib/schemas";

const NodeContent: React.FC<{
  name: string;
  details: string;
  onClick: () => void;
  onExpand: () => void;
  isExpanded: boolean;
  hasChildren: boolean;
}> = ({ name, onClick, onExpand, isExpanded, hasChildren }) => (
  <div
    className="p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out cursor-pointer w-48 bg-white hover:bg-gray-100 flex items-center justify-between"
    onClick={onClick}
  >
    <div className="text-lg font-bold">{name}</div>
    {hasChildren && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
      >
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
    )}
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
  subtopic: Subtopic,
  parentId: string | null,
  x: number,
  y: number,
  level: number,
  horizontalSpacing: number,
  verticalSpacing: number,
  expandedNodes: Set<string>,
  onExpand: (nodeId: string, parentId: string | null) => void
): { nodes: Node[]; edges: Edge[] } => {
  const nodeId = `${parentId ? `${parentId}-` : ""}${subtopic.name.replace(
    /\s+/g,
    "-"
  )}`;
  const nodeType =
    level === 0
      ? "root"
      : subtopic.subtopics && subtopic.subtopics.length > 0
      ? "branch"
      : "leaf";
  const isExpanded = expandedNodes.has(nodeId);

  const newNode: Node = {
    id: nodeId,
    type: nodeType,
    position: { x, y },
    data: {
      name: subtopic.name,
      details: subtopic.details,
      links: subtopic.links,
      isExpanded,
      hasChildren: subtopic.subtopics && subtopic.subtopics.length > 0,
      onExpand: () => onExpand(nodeId, parentId),
      onClick: () => {},
      parentId,
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

  if (isExpanded && subtopic.subtopics && subtopic.subtopics.length > 0) {
    const childrenCount = subtopic.subtopics.length;
    const totalWidth = childrenCount * horizontalSpacing;
    const startX = x - totalWidth / 2 + horizontalSpacing / 2;

    subtopic.subtopics.forEach((childSubtopic: Subtopic, index: number) => {
      const childX = startX + index * horizontalSpacing;
      const childY = y + verticalSpacing;
      const { nodes: childNodes, edges: childEdges } = createNodesAndEdges(
        childSubtopic,
        nodeId,
        childX,
        childY,
        level + 1,
        horizontalSpacing,
        verticalSpacing * 1.2,
        expandedNodes,
        onExpand
      );
      nodes = [...nodes, ...childNodes];
      edges = [...edges, ...childEdges];
    });
  }

  return { nodes, edges };
};

const MindMap: React.FC<{ data: MindMapData | null }> = ({ data }) => {
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 110);

    return () => clearTimeout(timer);
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedSubtopic(node.data as Subtopic);
  }, []);

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, []);

  useEffect(() => {
    if (!data) return;

    const onExpand = (nodeId: string, parentId: string | null) => {
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          // If expanding, close other expanded siblings
          if (parentId) {
            nodes.forEach((node) => {
              if (node.data.parentId === parentId && node.id !== nodeId) {
                newSet.delete(node.id);
              }
            });
          }
          newSet.add(nodeId);
        }
        return newSet;
      });
    };

    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(
      { name: data.topic, details: "", links: [], subtopics: data.subtopics },
      null,
      0,
      0,
      0,
      300,
      150,
      expandedNodes,
      onExpand
    );

    setNodes(
      newNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onClick: () => onNodeClick({} as React.MouseEvent, node),
        },
      }))
    );
    setEdges(newEdges);
  }, [data, expandedNodes, setNodes, setEdges, onNodeClick]);

  const downloadMarkdown = () => {
    if (!data) return;
    const markdown = convertToMarkdown(data);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.topic.replace(/\s+/g, "_")}_mind_map.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!data) return;
    downloadJson(data, `${data.topic.replace(/\s+/g, "_")}_mind_map.json`);
  };

  const nodeTypes = useMemo(
    () => ({
      root: RootNode,
      branch: BranchNode,
      leaf: LeafNode,
    }),
    []
  );

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
              defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
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
      <Sheet
        open={!!selectedSubtopic}
        onOpenChange={() => setSelectedSubtopic(null)}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl mt-4 font-bold">
              {selectedSubtopic?.name}
            </SheetTitle>
            <SheetDescription className="mb-2 text-gray-700">
              {selectedSubtopic?.details}
            </SheetDescription>
          </SheetHeader>
          {selectedSubtopic?.links && selectedSubtopic.links.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Learn More</h3>
              <div className="space-y-2 mt-4">
                {selectedSubtopic.links.map((link: Link, index: number) => (
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
