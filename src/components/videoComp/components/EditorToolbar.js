
import { 
    Scissors, 
    Crop, 
    Sliders, 
    Filter, 
    Pencil, 
    Sticker, 
    ScanFace,
    Maximize, 
  } from "lucide-react";
  import { Button } from "../../ui/Buttons";
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
  import { EditorTool } from "./Editor";
  
  
  const ToolbarButton = ({ label, icon, active, onClick }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={active ? "secondary" : "ghost"}
            size="icon"
            onClick={onClick}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-1 ${
              active ? "bg-editor-control text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <div className="h-6 w-6 flex items-center justify-center">
              {icon}
            </div>
            <span className="text-xs font-normal">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  const EditorToolbar = ({ activeTool, onToolChange, mediaType }) => {
    const tools = [
      {
        id: "trim",
        label: "Trim",
        icon: <Scissors className="h-5 w-5" />,
        showFor: ["video"],
      },
      {
        id: "crop",
        label: "Crop",
        icon: <Crop className="h-5 w-5" />,
        showFor: ["image", "video"],
      },
      {
        id: "finetune",
        label: "Finetune",
        icon: <Sliders className="h-5 w-5" />,
        showFor: ["image", "video"],
      },
      {
        id: "filter",
        label: "Filter",
        icon: <Filter className="h-5 w-5" />,
        showFor: ["image", "video"],
      },
      {
        id: "annotate",
        label: "Annotate",
        icon: <Pencil className="h-5 w-5" />,
        showFor: ["image", "video"],
      },
      {
        id: "sticker",
        label: "Sticker",
        icon: <Sticker className="h-5 w-5" />,
        showFor: ["image", "video"],
      },
      {
        id: "resize",
        label: "Resize",
        icon: <Maximize className="h-5 w-5" />,
        showFor: ["image", "video"],
      },
    ];
  
    return (
      <div className="w-16 bg-editor-darker border-r border-gray-800 flex flex-col">
        {tools
          .filter(tool => tool.showFor.includes(mediaType))
          .map(tool => (
            <ToolbarButton
              key={tool.id}
              label={tool.label}
              icon={tool.icon}
              active={activeTool === tool.id}
              onClick={() => onToolChange(tool.id)}
            />
          ))}
      </div>
    );
  };
  
  export default EditorToolbar;
  