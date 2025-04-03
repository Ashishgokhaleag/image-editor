import {
  Crop,
  Sliders,
  Filter,
  Pencil,
  SquareStack,
  Eraser,
  Type,
  Square,
  Circle,
  Drama,
  Shapes,
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

export const frames = [
  { id: "None", name: "None" },
  { id: "Mat", name: "Mat" },
  { id: "Bevel", name: "Bevel" },
  { id: "Line", name: "Line" },
  { id: "Zebra", name: "Zebra" },
  { id: "Lumber", name: "Lumber" },
  { id: "Inset", name: "Inset" },
  { id: "Plus", name: "Plus" },
  { id: "Hook", name: "Hook" },
  { id: "Polaroid", name: "Polaroid" },
];

export const tools = [
  { id: "crop", name: "Crop", icon: <Crop className="sidebar-icon" /> },
  {
    id: "adjust",
    name: "Adjust",
    icon: <Sliders className="sidebar-icon" />,
  },
  { id: "filter", name: "Filter", icon: <Filter className="sidebar-icon" /> },
  {
    id: "annotate",
    name: "Annotate",
    icon: <Pencil className="sidebar-icon" />,
  },
  {
    id: "shapes",
    name: "Shapes",
    icon: <Shapes className="sidebar-icon" />,
  },
  {
    id: "masking",
    name: "Masking",
    icon: <Drama className="sidebar-icon" />,
  },
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
];

export const ShapesTools = [
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

//   export const shapes = [
//     {id: "", name: "", icon: }
//   ]
