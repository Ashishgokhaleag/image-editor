import { useState, useEffect, useRef } from "react"
import { Bold, Italic, Underline, StrikethroughIcon, AlignLeft, AlignCenter, AlignRight, X, Check } from "lucide-react"
import { Button } from "../../ui/Buttons"
import { Input } from "../../ui/input"
import { Slider } from "../../ui/slider"

const InlineTextEditor = ({ annotation, position, onUpdate, onClose, stageSize }) => {
  // Extract text content from HTML or use empty string if not available
  const extractTextContent = (htmlContent) => {
    if (htmlContent === undefined || htmlContent === null) return ""
    // Remove HTML tags and decode entities
    return htmlContent.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ")
  }

  const [text, setText] = useState(extractTextContent(annotation.content) || "")

  console.log("text?>>>>>", text)
  const [fontSize, setFontSize] = useState(annotation.style?.fontSize || 24)
  const [fontFamily, setFontFamily] = useState(annotation.style?.fontFamily || "sans-serif")
  const [textAlign, setTextAlign] = useState(annotation.style?.textAlign || "left")
  const [color, setColor] = useState(annotation.style?.color || "#FFFFFF")
  const [backgroundColor, setBackgroundColor] = useState(annotation.style?.backgroundColor || "rgba(0, 0, 0, 0.5)")
  const [textFormatting, setTextFormatting] = useState({
    bold: annotation.style?.bold || false,
    italic: annotation.style?.italic || false,
    underline: annotation.style?.underline || false,
    strikethrough: annotation.style?.strikethrough || false,
  })

  const editorRef = useRef(null)

  // Calculate position for the editor
  const editorStyle = {
    position: "absolute",
    top: `${Math.max(10, (position.y / 100) * stageSize.height - 150)}px`,
    left: `${Math.max(10, (position.x / 100) * stageSize.width - 150)}px`,
    zIndex: 1000,
    width: "300px",
    backgroundColor: "#1a1a2e",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
    padding: "12px",
    color: "white",
  }

  const toggleTextFormatting = (type) => {
    setTextFormatting((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  // Update the text on the canvas in real-time as the user types
  useEffect(() => {
    // Update the annotation with the current text as the user types
    // This needs to work even when removing characters from default text
    onUpdate(annotation.id, {
      content: text, // Allow any text, including empty or shorter than original
      style: {
        fontSize,
        fontFamily,
        textAlign,
        color,
        backgroundColor,
        ...textFormatting,
      },
    })

    // Force a redraw of the canvas
    setTimeout(() => {
      const stage = document.querySelector("canvas")
      if (stage && stage._konvaNode) {
        stage._konvaNode.batchDraw()
      }
    }, 10)
  }, [text, fontSize, fontFamily, textAlign, color, backgroundColor, textFormatting, annotation.id, onUpdate])

  // Update the handleApply function to ensure text content is properly formatted
  const handleApply = () => {
    // Use the text as is, even if it's empty
    onUpdate(annotation.id, {
      content: text,
      style: {
        fontSize,
        fontFamily,
        textAlign,
        color,
        backgroundColor,
        ...textFormatting,
      },
    })

    // Force a redraw after applying changes
    setTimeout(() => {
      const stage = document.querySelector("canvas")
      if (stage && stage._konvaNode) {
        stage._konvaNode.batchDraw()
      }
    }, 50)

    onClose()
  }

  // Handle clicks outside the editor to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        // Auto-save changes when clicking outside
        handleApply()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [text, fontSize, fontFamily, textAlign, color, backgroundColor, textFormatting])

  // Add a useEffect to focus the textarea when the editor opens
  useEffect(() => {
    const textArea = document.querySelector("textarea")
    if (textArea) {
      textArea.focus()
      textArea.select()
    }
  }, [])

  return (
    <div ref={editorRef} style={editorStyle}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Edit Text</h3>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-700 min-h-[60px] resize-none"
          autoFocus
          placeholder="Enter your text here"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Font Size</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[fontSize]}
              min={8}
              max={72}
              step={1}
              onValueChange={(values) => setFontSize(values[0])}
              className="flex-1"
            />
            <span className="text-xs w-8 text-right">{fontSize}px</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Font</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-gray-800 text-white p-1 rounded-md border border-gray-700 text-xs"
          >
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Text Color</label>
          <div className="flex">
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 p-1 rounded-l-md border-r-0"
            />
            <div className="flex-1 flex items-center justify-between bg-gray-800 rounded-r-md px-2 text-xs">
              {color.toUpperCase()}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Background</label>
          <div className="flex">
            <Input
              type="color"
              value={backgroundColor.startsWith("rgba") ? "#000000" : backgroundColor}
              onChange={(e) => {
                // Convert hex to rgba with 0.5 opacity
                const hex = e.target.value
                const r = Number.parseInt(hex.slice(1, 3), 16)
                const g = Number.parseInt(hex.slice(3, 5), 16)
                const b = Number.parseInt(hex.slice(5, 7), 16)
                setBackgroundColor(`rgba(${r}, ${g}, ${b}, 0.5)`)
              }}
              className="w-8 h-8 p-1 rounded-l-md border-r-0"
            />
            <div className="flex-1 flex items-center justify-between bg-gray-800 rounded-r-md px-2 text-xs">
              <span>Opacity: 50%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-3">
        <div className="flex gap-1">
          <Button
            variant={textFormatting.bold ? "secondary" : "outline"}
            size="icon"
            onClick={() => toggleTextFormatting("bold")}
            className="h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={textFormatting.italic ? "secondary" : "outline"}
            size="icon"
            onClick={() => toggleTextFormatting("italic")}
            className="h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={textFormatting.underline ? "secondary" : "outline"}
            size="icon"
            onClick={() => toggleTextFormatting("underline")}
            className="h-8 w-8"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant={textFormatting.strikethrough ? "secondary" : "outline"}
            size="icon"
            onClick={() => toggleTextFormatting("strikethrough")}
            className="h-8 w-8"
          >
            <StrikethroughIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            variant={textAlign === "left" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setTextAlign("left")}
            className="h-8 w-8"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlign === "center" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setTextAlign("center")}
            className="h-8 w-8"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlign === "right" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setTextAlign("right")}
            className="h-8 w-8"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
          <Check className="h-4 w-4 mr-1" />
          Apply
        </Button>
      </div>
    </div>
  )
}

export default InlineTextEditor
