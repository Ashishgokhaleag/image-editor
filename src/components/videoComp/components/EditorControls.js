
import { ReactNode } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "../../ui/Buttons";
import { Slider } from "../../ui/slider";
import { EditorTool } from "./Editor";

const toolLabels = {
  trim: "Trim Video",
  crop: "Crop",
  finetune: "Fine Tune",
  filter: "Filters",
  annotate: "Annotate",
  sticker: "Stickers",
  resize: "Resize",
};

const EditorControls = ({ activeTool, onClose, children, zoom, onZoomChange }) => {
  if (!activeTool) return null;

  return (
    <div className="w-72 bg-editor-darker border-l border-gray-800 flex flex-col">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-medium text-white">
          {toolLabels[activeTool]}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
      
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            className="h-8 w-8 text-gray-400 hover:text-white"
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Slider
            value={[zoom]}
            min={50}
            max={200}
            step={1}
            onValueChange={(values) => onZoomChange(values[0])}
            className="flex-1"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            className="h-8 w-8 text-gray-400 hover:text-white"
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <span className="text-xs text-gray-400 w-12 text-center">
            {zoom}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default EditorControls;
