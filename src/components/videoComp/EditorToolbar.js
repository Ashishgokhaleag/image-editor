import {
  SlidersHorizontal,
  Crop,
  Pencil,
  Sticker,
  Files,
  LayoutPanelTop,
  ImageIcon,
  Upload,
} from "lucide-react";

const EditorToolbar = ({ onToolSelect, isDarkMode = true }) => {
  const tools = [
    { id: "trim", icon: <LayoutPanelTop size={20} />, label: "Trim" },
    { id: "crop", icon: <Crop size={20} />, label: "Crop" },
    {
      id: "finetune",
      icon: <SlidersHorizontal size={20} />,
      label: "Finetune",
    },
    { id: "filter", icon: <Files size={20} />, label: "Filter" },
    { id: "annotate", icon: <Pencil size={20} />, label: "Annotate" },
    { id: "sticker", icon: <Sticker size={20} />, label: "Sticker" },
    { id: "resize", icon: <ImageIcon size={20} />, label: "Resize" },
    { id: "upload", icon: <Upload size={20} />, label: "Upload" },
  ];

  return (
    <div
      className={`flex justify-around items-center ${
        isDarkMode
          ? "bg-black p-4 border-t border-gray-800"
          : "bg-white p-4 border-t border-gray-300"
      }`}
    >
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`flex flex-col items-center justify-center rounded-full w-12 h-12 ${
            isDarkMode ? "bg-gray-800" : "bg-gray-200"
          }`}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default EditorToolbar;
