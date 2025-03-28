import {
    Crop,
    Sliders,
    Filter,
    Pencil,
    Sticker,
    PaintBucket,
    FileX,
    SquareStack,
    RotateCcw,
    Redo,
    Minus,
    Plus,
    Eraser,
    Type,
    PenTool,
    MoveRight,
    Square,
    Circle,
    FlipHorizontal,
  } from "lucide-react";

export const filters = [
    { id: "default", name: "Default" },
    { id: "chrome", name: "Chrome" },
    { id: "fade", name: "Fade" },
    { id: "cold", name: "Cold" },
    { id: "warm", name: "Warm" },
    { id: "pastel", name: "Pastel" },
    { id: "mono", name: "Mono" },
    { id: "noir", name: "Noir" },
    { id: "stark", name: "Stark" },
    { id: "wash", name: "Wash" },
  ];

  export const tools = [
    { id: "crop", name: "Crop", icon: <Crop className="sidebar-icon" /> },
    {
      id: "finetune",
      name: "Finetune",
      icon: <Sliders className="sidebar-icon" />,
    },
    { id: "filter", name: "Filter", icon: <Filter className="sidebar-icon" /> },
    {
      id: "annotate",
      name: "Annotate",
      icon: <Pencil className="sidebar-icon" />,
    },
    {
      id: "sticker",
      name: "Sticker",
      icon: <Sticker className="sidebar-icon" />,
    },
    {
      id: "fill",
      name: "Fill",
      icon: <PaintBucket className="sidebar-icon" />,
    },
    { id: "redact", name: "Redact", icon: <FileX className="sidebar-icon" /> },
    {
      id: "frame",
      name: "Frame",
      icon: <SquareStack className="sidebar-icon" />,
    },
  ];

  export const annotationTools = [
    { id: "sharpie", name: "Sharpie", icon: <Pencil size={18} /> },
    { id: "eraser", name: "Eraser", icon: <Eraser size={18} /> },
    { id: "text", name: "Text", icon: <Type size={18} /> },
    { id: "path", name: "Path", icon: <PenTool size={18} /> },
    { id: "line", name: "Line", icon: <Minus size={18} /> },
    { id: "arrow", name: "Arrow", icon: <MoveRight size={18} /> },
    { id: "rectangle", name: "Rectangle", icon: <Square size={18} /> },
    { id: "ellipse", name: "Ellipse", icon: <Circle size={18} /> },
  ];

  export const lineWidths = [
    { id: "small", name: "Small", value: 2 },
    { id: "medium", name: "Medium", value: 4 },
    { id: "large", name: "Large", value: 8 },
  ];

  export const colors = [
    "#ffffff", // white
    "#000000", // black
    "#ff0000", // red
    "#00ff00", // green
    "#0000ff", // blue
    "#ffff00", // yellow
    "#ff00ff", // magenta
    "#00ffff", // cyan
  ];

  export const stickers = [
    { id: "star", emoji: "⭐" },
    { id: "smile", emoji: "😀" },
    { id: "thumbsup", emoji: "👍" },
    { id: "thumbsdown", emoji: "👎" },
    { id: "palette", emoji: "🎨" },
    { id: "paint", emoji: "🖌️" },
    { id: "sun", emoji: "☀️" },
    { id: "cloud", emoji: "☁️" },
  ];