import { tools } from "../../constant";

const DrawingTools = ({ onSelect, current, isDarkMode = true }) => {
  const tools = [
    { id: "sharpie", label: "Sharpie" },
    { id: "eraser", label: "Eraser" },
    { id: "text", label: "Text" },
    { id: "path", label: "Path" },
    { id: "line", label: "Line" },
    { id: "arrow", label: "Arrow" },
    { id: "rectangle", label: "Rectangle" },
    { id: "ellipse", label: "Ellipse" },
  ];

  return (
    <div
      className={`p-4 ${
        isDarkMode
          ? "bg-black border-t border-gray-800"
          : "bg-white border-t border-gray-300"
      }`}
    >
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelect(tool.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              current === tool.id
                ? isDarkMode
                  ? "bg-gray-700"
                  : "bg-gray-400"
                : isDarkMode
                ? "bg-gray-800"
                : "bg-gray-200"
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DrawingTools;
