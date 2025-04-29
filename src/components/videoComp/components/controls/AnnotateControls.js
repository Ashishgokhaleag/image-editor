import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import { Slider } from "../../../ui/slider"
import { Button } from "../../../ui/Buttons"
import { Input } from "../../../ui/input"
import { Pencil, Eraser, Type, Square, Circle, ArrowRight, Pipette, Bold, Italic, Underline, StrikethroughIcon } from 'lucide-react'

const annotationTools = [
  { id: "pencil", name: "Sharpie", icon: <Pencil className="h-4 w-4" /> },
  { id: "eraser", name: "Eraser", icon: <Eraser className="h-4 w-4" /> },
  { id: "text", name: "Text", icon: <Type className="h-4 w-4" /> },
  { id: "path", name: "Path", icon: <Pencil className="h-4 w-4" /> },
  { id: "line", name: "Line", icon: <ArrowRight className="h-4 w-4" /> },
  { id: "arrow", name: "Arrow", icon: <ArrowRight className="h-4 w-4" /> },
  { id: "rectangle", name: "Rectangle", icon: <Square className="h-4 w-4" /> },
  { id: "ellipse", name: "Ellipse", icon: <Circle className="h-4 w-4" /> },
]

const textAlignOptions = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
]

const fontOptions = [
  { id: "sans-serif", label: "Sans Serif" },
  { id: "serif", label: "Serif" },
  { id: "monospace", label: "Monospace" },
]

const AnnotateControls = ({ mediaRef, mediaType, onApplyAnnotations }) => {
  const [activeTool, setActiveTool] = useState("pencil")
  const [color, setColor] = useState("#FFFFFF")
  const [outlineColor, setOutlineColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(2)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("sans-serif")
  const [textAlign, setTextAlign] = useState("left")
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  })
  const [isDrawingMode, setIsDrawingMode] = useState(true) // Start with drawing mode active
  const [isDrawing, setIsDrawing] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)
  const textInputRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })

  const handleToolChange = (toolId) => {
    setActiveTool(toolId)

    if (toolId === "pencil" || toolId === "path" || toolId === "eraser") {
      activateDrawingMode()
    } else {
      setIsDrawingMode(true) // Keep drawing mode active for other tools too
    }

    // Update cursor style based on tool
    updateCursorStyle(toolId)

    // Initialize canvas for the selected tool
    setupCanvas()
  }

  const updateCursorStyle = (toolId) => {
    if (!canvasRef.current) return

    switch (toolId) {
      case "pencil":
      case "path":
        canvasRef.current.style.cursor = "crosshair"
        break
      case "eraser":
        canvasRef.current.style.cursor =
          'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M18 13L11 20L8 17L15 10M18 13L20 11L13 4L11 6M18 13L15 10M11 6L15 10" /></svg>\'), auto'
        break
      case "text":
        canvasRef.current.style.cursor = "text"
        break
      default:
        canvasRef.current.style.cursor = "crosshair"
    }
  }

  const toggleTextFormatting = (type) => {
    setTextFormatting((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))

    // Apply text formatting immediately to text input
    if (textInputRef.current && textInputRef.current.style.display !== "none") {
      if (type === "bold") {
        textInputRef.current.style.fontWeight = textFormatting.bold ? "normal" : "bold"
      } else if (type === "italic") {
        textInputRef.current.style.fontStyle = textFormatting.italic ? "normal" : "italic"
      } else if (type === "underline" || type === "strikethrough") {
        updateTextDecoration()
      }
    }
  }

  const updateTextDecoration = () => {
    if (!textInputRef.current) return

    if (textFormatting.underline && textFormatting.strikethrough) {
      textInputRef.current.style.textDecoration = "underline line-through"
    } else if (textFormatting.underline) {
      textInputRef.current.style.textDecoration = "underline"
    } else if (textFormatting.strikethrough) {
      textInputRef.current.style.textDecoration = "line-through"
    } else {
      textInputRef.current.style.textDecoration = "none"
    }
  }

  const activateDrawingMode = () => {
    setIsDrawingMode(true)
  }

  const deactivateDrawingMode = () => {
    setIsDrawingMode(false)
  }

  // This function properly positions and sizes the canvas
  const updateCanvasPosition = () => {
    if (!mediaRef.current || !canvasRef.current || !canvasContainerRef.current) return

    const mediaElement = mediaRef.current
    const canvas = canvasRef.current
    const mediaRect = mediaElement.getBoundingClientRect()

    // Set canvas dimensions to match the media element exactly
    // canvas.width = mediaElement.offsetWidth
    // canvas.height = mediaElement.offsetHeight

    // Position the canvas container to perfectly overlay the media element
    canvasContainerRef.current.style.position = "absolute"
    canvasContainerRef.current.style.left = "6.5%"
    canvasContainerRef.current.style.top = "12.9%"
    canvasContainerRef.current.style.width = "100%"
    canvasContainerRef.current.style.height = "100%"
    canvasContainerRef.current.style.pointerEvents = "none" // Allow clicks to pass through
    canvas.style.pointerEvents = "auto" // But enable pointer events on the canvas itself

    // Update offset for mouse position calculations based on the media element's position
    const containerRect = canvasContainerRef.current.getBoundingClientRect()
    setCanvasOffset({
      x: containerRect.left,
      y: containerRect.top,
    })
  }

  const setupCanvas = () => {
    if (!mediaRef.current || !canvasRef.current) return


    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    const mediaElement = mediaRef.current

    if(canvas.width==mediaElement.offsetHeight || canvas.height ==mediaElement.offsetHeight)
    {
      console.log("no need to update")
    }
    else
    {
      canvas.width = mediaElement.offsetWidth
      canvas.height = mediaElement.offsetHeight
    }
    

    // Set up canvas styles based on the current tool
    ctx.strokeStyle = outlineColor
    ctx.fillStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (activeTool === "text") {
      ctx.font = `${textFormatting.bold ? "bold " : ""}${textFormatting.italic ? "italic " : ""}${fontSize}px ${fontFamily}`
      ctx.textAlign = textAlign
    }

    updateCursorStyle(activeTool)
    updateCanvasPosition()

  }

  const getCanvasContext = () => {
    if (!canvasRef.current) return null
    return canvasRef.current.getContext("2d")
  }

  const handleMouseDown = (e) => {
    if (!isDrawingMode || !canvasRef.current) return

    e.preventDefault() // Prevent default behavior
    setIsDrawing(true)

    const x = e.clientX - canvasOffset.x
    const y = e.clientY - canvasOffset.y

    setMousePosition({ x, y })
    setStartPosition({ x, y })

    const ctx = getCanvasContext()
    if (!ctx) return

    if (activeTool === "pencil" || activeTool === "path") {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  // const handleMouseMove = (e) => {
  //   if (!isDrawing || !isDrawingMode || !canvasRef.current) return;

  //   e.preventDefault(); // Prevent default behavior

  //   const x = e.clientX - canvasOffset.x;
  //   const y = e.clientY - canvasOffset.y;

  //   const ctx = getCanvasContext();
  //   if (!ctx) return;

  //   if (activeTool === "pencil" || activeTool === "path") {
  //     ctx.lineTo(x, y);
  //     ctx.stroke();
  //   } else if (activeTool === "eraser") {
  //     // Eraser as a white brush with composition mode
  //     ctx.globalCompositeOperation = 'destination-out';
  //     ctx.beginPath();
  //     ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2);
  //     ctx.fill();
  //     ctx.globalCompositeOperation = 'source-over';
  //   }

  //   setMousePosition({ x, y });
  // };

  const handleMouseMove = (e) => {
    if (!isDrawing || !isDrawingMode || !canvasRef.current) return

    e.preventDefault() // Prevent default behavior

    const x = e.clientX - canvasOffset.x
    const y = e.clientY - canvasOffset.y

    const ctx = getCanvasContext()
    if (!ctx) return

    if (activeTool === "pencil" || activeTool === "path") {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (activeTool === "eraser") {
      // Eraser as a white brush with composition mode that only erases where the user drags
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = "source-over"
    }

    setMousePosition({ x, y })
  }

  const handleMouseUp = (e) => {
    if (!isDrawing || !canvasRef.current) return

    e.preventDefault() // Prevent default behavior
    setIsDrawing(false)

    const x = e.clientX - canvasOffset.x
    const y = e.clientY - canvasOffset.y

    const ctx = getCanvasContext()
    if (!ctx) return

    if (activeTool === "line") {
      ctx.beginPath()
      ctx.moveTo(startPosition.x, startPosition.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (activeTool === "arrow") {
      drawArrow(ctx, startPosition.x, startPosition.y, x, y)
    } else if (activeTool === "rectangle") {
      ctx.beginPath()
      ctx.rect(startPosition.x, startPosition.y, x - startPosition.x, y - startPosition.y)
      ctx.stroke()
      ctx.fill()
    } else if (activeTool === "ellipse") {
      const radiusX = Math.abs(x - startPosition.x) / 2
      const radiusY = Math.abs(y - startPosition.y) / 2
      const centerX = startPosition.x + (x - startPosition.x) / 2
      const centerY = startPosition.y + (y - startPosition.y) / 2

      ctx.beginPath()
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fill()
    } else if (activeTool === "text") {
      // For text tool, we'll show a text input at the clicked position
      if (textInputRef.current) {
        textInputRef.current.style.left = `${x}px`
        textInputRef.current.style.top = `${y}px`
        textInputRef.current.style.display = "block"
        textInputRef.current.innerHTML = "" // Clear any previous content
        textInputRef.current.setAttribute("data-placeholder", "Enter text here")
        textInputRef.current.focus()

        // Apply current text formatting to input
        textInputRef.current.style.fontFamily = fontFamily
        textInputRef.current.style.fontSize = `${fontSize}px`
        textInputRef.current.style.fontWeight = textFormatting.bold ? "bold" : "normal"
        textInputRef.current.style.fontStyle = textFormatting.italic ? "italic" : "normal"
        textInputRef.current.style.textAlign = textAlign
        updateTextDecoration()
      }
    }

    // After drawing, log the annotation that was created
    logAnnotation()
  }

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 15
    const angle = Math.atan2(toY - fromY, toX - fromX)

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    // Draw the arrow head
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
  }

  const applyTextFormatting = () => {
    if (!textInputRef.current || !canvasRef.current) return

    const text = textInputRef.current.value
    if (!text) {
      textInputRef.current.style.display = "none"
      return
    }

    const ctx = getCanvasContext()
    if (!ctx) return

    // Apply text formatting
    let fontString = fontSize + "px " + fontFamily
    if (textFormatting.bold) fontString = "bold " + fontString
    if (textFormatting.italic) fontString = "italic " + fontString

    ctx.font = fontString
    ctx.textAlign = textAlign
    ctx.fillStyle = color

    // Get position from the input element position
    const x = Number.parseInt(textInputRef.current.style.left || "0")
    const y = Number.parseInt(textInputRef.current.style.top || "0") + fontSize // Adjust y to align with baseline

    // Draw the text
    ctx.fillText(text, x, y)

    // Apply underline or strikethrough if enabled
    if (textFormatting.underline || textFormatting.strikethrough) {
      const metrics = ctx.measureText(text)
      const textWidth = metrics.width

      ctx.beginPath()
      if (textFormatting.underline) {
        ctx.moveTo(x, y + 3)
        ctx.lineTo(x + textWidth, y + 3)
      }

      if (textFormatting.strikethrough) {
        ctx.moveTo(x, y - fontSize / 2)
        ctx.lineTo(x + textWidth, y - fontSize / 2)
      }

      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Hide and clear the text input
    textInputRef.current.style.display = "none"
    textInputRef.current.value = ""

    // Log the text annotation
    logAnnotation(text)
  }

  const handleTextInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      applyTextFormatting()
    }
    // Backspace will work naturally with contentEditable
  }

  const logAnnotation = (text) => {
    const settings = {
      tool: activeTool,
      color,
      outlineColor,
      lineWidth,
      fontSize,
      fontFamily,
      textAlign,
      textFormatting,
    }

    console.log("Adding annotation:", settings)

    if (text) {
      console.log("Text content:", text)
    }
  }

  // Handle Apply Annotations button click
  const handleApplyAnnotations = () => {
    if (onApplyAnnotations) {
      onApplyAnnotations()
    }
  }

  // Initialize canvas when component mounts and when dependencies change
  useEffect(() => {
    if (!mediaRef.current) return

    // Set up canvas and drawing capability when the component mounts
    setupCanvas()
    activateDrawingMode() // Start in drawing mode

    // When tool settings change, update the canvas context
    const updateCanvasSettings = () => {
      const ctx = getCanvasContext()
      if (!ctx) return

      ctx.strokeStyle = outlineColor
      ctx.fillStyle = color
      ctx.lineWidth = lineWidth

      if (activeTool === "text") {
        let fontString = fontSize + "px " + fontFamily
        if (textFormatting.bold) fontString = "bold " + fontString
        if (textFormatting.italic) fontString = "italic " + fontString
        ctx.font = fontString
        ctx.textAlign = textAlign
      }
    }

    updateCanvasSettings()

    const style = document.createElement("style")
    style.innerHTML = `
      [contenteditable]:empty:before {
        content: attr(data-placeholder);
        color: gray;
        font-style: italic;
      }
    `
    document.head.appendChild(style)

    return () => {
      // Cleanup drawing capability
      deactivateDrawingMode()
      document.head.removeChild(style)
    }
  }, [mediaRef, activeTool, color, outlineColor, lineWidth, fontSize, fontFamily, textAlign, textFormatting])

  // Update canvas position when window resizes or when media element changes
  useEffect(() => {
    if (!mediaRef.current) return

    // Position canvas correctly
    updateCanvasPosition()

    // Re-position on window resize
    const handleResize = () => {
      updateCanvasPosition()
    }

    window.addEventListener("resize", handleResize)

    // Check if video metadata is loaded
    if (mediaType === "video" && mediaRef.current instanceof HTMLVideoElement) {
      mediaRef.current.addEventListener("loadedmetadata", updateCanvasPosition)
    } else if (mediaType === "image" && mediaRef.current instanceof HTMLImageElement) {
      mediaRef.current.addEventListener("load", updateCanvasPosition)
    }

    return () => {
      window.removeEventListener("resize", handleResize)

      if (mediaRef.current) {
        if (mediaType === "video" && mediaRef.current instanceof HTMLVideoElement) {
          mediaRef.current.removeEventListener("loadedmetadata", updateCanvasPosition)
        } else if (mediaType === "image" && mediaRef.current instanceof HTMLImageElement) {
          mediaRef.current.removeEventListener("load", updateCanvasPosition)
        }
      }
    }
  }, [mediaRef, mediaType])

  return (
    <div className="space-y-1">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white mb-2">Annotation Tools</h4>
        <div className="grid grid-cols-4 gap-2">
          {annotationTools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleToolChange(tool.id)}
              className={`${
                activeTool === tool.id ? "bg-editor-control text-white" : "text-gray-400 hover:text-white"
              } px-2 h-10`}
            >
              <div className="flex flex-col items-center justify-center">
                {tool.icon}
                <span className="text-[10px] mt-1">{tool.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="text" disabled={activeTool !== "text"}>
            Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-4 pt-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Fill Color</label>
              <div className="flex">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 p-1 rounded-l-md border-r-0"
                />
                <div className="flex-1 flex items-center justify-between bg-gray-800 rounded-r-md px-3">
                  <span className="text-xs text-gray-300">{color.toUpperCase()}</span>
                  <Pipette className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Line Color</label>
              <div className="flex">
                <Input
                  type="color"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="w-10 h-10 p-1 rounded-l-md border-r-0"
                />
                <div className="flex-1 flex items-center justify-between bg-gray-800 rounded-r-md px-3">
                  <span className="text-xs text-gray-300">{outlineColor.toUpperCase()}</span>
                  <Pipette className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Line Width</label>
              <span className="text-xs text-gray-400 ">{lineWidth}px</span>
            </div>
            <Slider
              value={[lineWidth]}
              min={1}
              max={20}
              step={1}
              onValueChange={(values) => setLineWidth(values[0])}
              className="range-input"
            />
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-4 pt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Font Size</label>
              <span className="text-xs text-gray-400">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              min={8}
              max={72}
              step={1}
              onValueChange={(values) => setFontSize(values[0])}
              className="range-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400">Font</label>
            <div className="grid grid-cols-3 gap-2">
              {fontOptions.map((font) => (
                <Button
                  key={font.id}
                  variant={fontFamily === font.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setFontFamily(font.id)}
                  className={`${
                    fontFamily === font.id ? "bg-editor-control text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {font.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400">Text Alignment</label>
            <div className="grid grid-cols-3 gap-2">
              {textAlignOptions.map((align) => (
                <Button
                  key={align.id}
                  variant={textAlign === align.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setTextAlign(align.id)}
                  className={`${
                    textAlign === align.id ? "bg-editor-control text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {align.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400">Text Formatting</label>
            <div className="flex gap-2">
              <Button
                variant={textFormatting.bold ? "secondary" : "outline"}
                size="icon"
                onClick={() => toggleTextFormatting("bold")}
                className={`${textFormatting.bold ? "bg-editor-control text-white" : "text-gray-400 hover:text-white"}`}
              >
                <Bold className="h-4 w-4" />
              </Button>

              <Button
                variant={textFormatting.italic ? "secondary" : "outline"}
                size="icon"
                onClick={() => toggleTextFormatting("italic")}
                className={`${
                  textFormatting.italic ? "bg-editor-control text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Italic className="h-4 w-4" />
              </Button>

              <Button
                variant={textFormatting.underline ? "secondary" : "outline"}
                size="icon"
                onClick={() => toggleTextFormatting("underline")}
                className={`${
                  textFormatting.underline ? "bg-editor-control text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Underline className="h-4 w-4" />
              </Button>

              <Button
                variant={textFormatting.strikethrough ? "secondary" : "outline"}
                size="icon"
                onClick={() => toggleTextFormatting("strikethrough")}
                className={`${
                  textFormatting.strikethrough ? "bg-editor-control text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <StrikethroughIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t border-gray-800">
        <Button className="w-full" onClick={handleApplyAnnotations}>
          Apply Annotations
        </Button>
      </div>

      {/* Container to properly position the canvas */}
      <div ref={canvasContainerRef} className="absolute top-0 left-0 pointer-events-none overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="pointer-events-auto border overflow-hidden"
          style={{ display: "block" }}
        />

        <div
          ref={textInputRef}
          contentEditable
          className="absolute border border-white text-white p-1 min-w-[100px] min-h-[40px] resize"
          style={{
            display: "none",
            position: "absolute",
            zIndex: 20,
            fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight: textFormatting.bold ? "bold" : "normal",
            fontStyle: textFormatting.italic ? "italic" : "normal",
            textAlign: textAlign,
            textDecoration: textFormatting.underline
              ? "underline"
              : textFormatting.strikethrough
                ? "line-through"
                : "none",
            resize: "both",
            overflow: "auto",
          }}
          onKeyDown={handleTextInputKeyDown}
          onBlur={applyTextFormatting}
          placeholder="Enter text here"
        ></div>
      </div>
    </div>
  )
}

export default AnnotateControls
