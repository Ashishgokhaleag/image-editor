import React from "react";
import { Minus, Plus, Redo, RotateCcw } from "lucide-react";

const EditorToolbar = ({ undo, redo, handleZoomOut, zoom, handleZoomIn }) => {
  return (
    <div className="p-3 flex justify-center">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-4">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={undo}
          >
            <RotateCcw size={18} className="text-white/70" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={redo}
          >
            <Redo size={18} className="text-white/70" />
          </button>
        </div>

        <div className="zoom-controls">
          <button
            className="hover:bg-white/10 p-1 rounded-full transition-colors"
            onClick={handleZoomOut}
          >
            <Minus size={16} className="text-white/70" />
          </button>

          <span className="text-sm text-white/70 w-12 text-center">
            {zoom}%
          </span>

          <button
            className="hover:bg-white/10 p-1 rounded-full transition-colors"
            onClick={handleZoomIn}
          >
            <Plus size={16} className="text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
