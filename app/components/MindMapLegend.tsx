import React from "react";

const MindMapLegend: React.FC = () => {
  return (
    <ul className="space-y-2 text-sm">
      <li>• Click a node to view details;</li>
      <li>• Click the arrow to expand or collapse a node;</li>
      <li>• Use mouse wheel or pinch to zoom;</li>
      <li>• Click and drag the background to pan;</li>
      <li>• Download the map as JSON or Markdown.</li>
    </ul>
  );
};

export default MindMapLegend;
