import React from "react";
import { Redo, RotateCcw } from "lucide-react";
import { tools } from "../constant";

const Sidebar = ({ undo, redo, activeTool, handleToolSelect }) => {
  return (
    <div className="w-20 bg-editor-sidebar border-r border-white/10 flex flex-col items-center py-4 overflow-y-auto">
      <button onClick={() => undo()} className="sidebar-tool mb-2">
        <RotateCcw className="sidebar-icon" />
        <span>Undo</span>
      </button>

      <button onClick={() => redo()} className="sidebar-tool mb-2">
        <Redo className="sidebar-icon" />
        <span>Redo</span>
      </button>

      <div className="w-10 h-px bg-white/10 my-2"></div>

      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`sidebar-tool ${activeTool === tool.id ? "active" : ""}`}
          onClick={() => handleToolSelect(tool.id)}
        >
          {tool.icon}
          <span>{tool.name}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
