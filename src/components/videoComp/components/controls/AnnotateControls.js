"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import { Slider } from "../../../ui/slider"
import { Button } from "../../../ui/Buttons"
import { Input } from "../../../ui/input"
import {
  Pencil,
  Eraser,
  Type,
  Square,
  Circle,
  ArrowRight,
  Pipette,
  Bold,
  Italic,
  Underline,
  StrikethroughIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapUnderline from "@tiptap/extension-underline"
import TiptapStrike from "@tiptap/extension-strike"
import TiptapColor from "@tiptap/extension-color"
import TiptapTextAlign from "@tiptap/extension-text-align"
import TiptapFontFamily from "@tiptap/extension-font-family"
import TextStyle from "@tiptap/extension-text-style"

const annotationTools = [
  { id: "text", name: "Text", icon: <Type className="h-4 w-4" /> },
  { id: "line", name: "Line", icon: <Pencil className="h-4 w-4" /> },
  { id: "arrow", name: "Arrow", icon: <ArrowRight className="h-4 w-4" /> },
  { id: "rectangle", name: "Rectangle", icon: <Square className="h-4 w-4" /> },
  { id: "ellipse", name: "Ellipse", icon: <Circle className="h-4 w-4" /> },
  { id: "freehand", name: "Freehand", icon: <Pencil className="h-4 w-4" /> },
  { id: "eraser", name: "Eraser", icon: <Eraser className="h-4 w-4" /> },
]

const textAlignOptions = [
  { id: "left", label: "Left", icon: <AlignLeft className="h-4 w-4" /> },
  { id: "center", label: "Center", icon: <AlignCenter className="h-4 w-4" /> },
  { id: "right", label: "Right", icon: <AlignRight className="h-4 w-4" /> },
]

const fontOptions = [
  { id: "sans-serif", label: "Sans Serif" },
  { id: "serif", label: "Serif" },
  { id: "monospace", label: "Monospace" },
]

const AnnotateControls = ({
  mediaRef,
  mediaType,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  annotations = [],
  selectedAnnotation,
  setSelectedAnnotation,
  editingAnnotationId,
  setEditingAnnotationId,
  stageRef,
  mediaDimensions,
}) => {
  const [activeTool, setActiveTool] = useState("text")
  const [color, setColor] = useState("#FFFFFF")
  const [outlineColor, setOutlineColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(2)
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState("sans-serif")
  const [textAlign, setTextAlign] = useState("left")
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  })
  const [showTiptap, setShowTiptap] = useState(false)
  const [tiptapPosition, setTiptapPosition] = useState({ x: 50, y: 50 })
  const tiptapContainerRef = useRef(null)
  const [annotationsState, setAnnotations] = useState(annotations)

  // Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      TiptapUnderline,
      TiptapStrike,
      TiptapColor.configure({ types: ["textStyle"] }),
      TiptapTextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TiptapFontFamily.configure({
        types: ["textStyle"],
      }),
    ],
    content: "<p>Enter your text here</p>",
    editorProps: {
      attributes: {
        class: "outline-none text-white p-2 min-h-[100px]",
      },
    },
    onUpdate: ({ editor }) => {
      if (selectedAnnotation) {
        const content = editor.getHTML()
        onUpdateAnnotation(selectedAnnotation, { content })
      }
    },
  })

  // Find selected annotation
  useEffect(() => {
    if (selectedAnnotation) {
      const annotation = annotations.find((a) => a.id === selectedAnnotation)
      if (annotation) {
        // Update controls based on selected annotation
        if (annotation.type === "text" && annotation.style) {
          setFontSize(annotation.style.fontSize || 24)
          setFontFamily(annotation.style.fontFamily || "sans-serif")
          setTextAlign(annotation.style.textAlign || "left")
          setColor(annotation.style.color || "#FFFFFF")
          setTextFormatting({
            bold: annotation.style.bold || false,
            italic: annotation.style.italic || false,
            underline: annotation.style.underline || false,
            strikethrough: annotation.style.strikethrough || false,
          })

          // Set active tool to text
          setActiveTool("text")

          // Show Tiptap editor for immediate text editing
          setShowTiptap(true)
        } else {
          setLineWidth(annotation.style?.strokeWidth || 2)
          setOutlineColor(annotation.style?.stroke || "#FFFFFF")
          setColor(annotation.style?.fill || "rgba(255, 255, 255, 0.2)")
        }
      }
    }
  }, [selectedAnnotation, annotations])

  // Update editor when selected annotation changes
  useEffect(() => {
    if (!editor) return

    if (selectedAnnotation) {
      const annotation = annotations.find((a) => a.id === selectedAnnotation)
      if (annotation && annotation.type === "text") {
        // Use empty content if the annotation content is empty
        editor.commands.setContent(annotation.content || "")

        // Apply text formatting
        if (annotation.style?.bold) editor.commands.setBold(true)
        if (annotation.style?.italic) editor.commands.setItalic(true)
        if (annotation.style?.underline) editor.commands.setUnderline(true)
        if (annotation.style?.strikethrough) editor.commands.setStrike(true)

        // Set text alignment
        if (annotation.style?.textAlign) {
          editor.commands.setTextAlign(annotation.style.textAlign)
        }

        // Set font family
        if (annotation.style?.fontFamily) {
          editor.commands.setFontFamily(annotation.style.fontFamily)
        }

        // Set text color
        if (annotation.style?.color) {
          editor.commands.setColor(annotation.style.color)
        }
      }
    } else {
      editor.commands.setContent("")
    }
  }, [selectedAnnotation, annotations, editor])

  // Update the AnnotateControls component to handle tool selection properly
  const handleToolChange = (toolId) => {
    setActiveTool(toolId)

    // If selecting eraser, update the selected annotation
    if (toolId === "eraser") {
      // Create a special eraser annotation if it doesn't exist
      const eraserAnnotation = annotations.find((a) => a.type === "eraser")
      if (!eraserAnnotation) {
        const newEraser = {
          id: Date.now(),
          type: "eraser",
          position: { x: 50, y: 50 },
        }
        onAddAnnotation(newEraser)
        setSelectedAnnotation(newEraser.id)
      } else {
        setSelectedAnnotation(eraserAnnotation.id)
      }
      return
    }

    // For freehand/pencil, create a special annotation
    if (toolId === "freehand" || toolId === "line") {
      const newDrawing = {
        id: Date.now(),
        type: toolId,
        position: { x: 0, y: 0 },
        points: [],
        style: {
          stroke: outlineColor,
          strokeWidth: lineWidth,
        },
      }
      onAddAnnotation(newDrawing)
      setSelectedAnnotation(newDrawing.id)
      return
    }

    // For other tools, create a normal annotation
    if (toolId !== "eraser") {
      createAnnotation(toolId)
    }
  }

  // Update the createAnnotation function to handle text properly
  const createAnnotation = (toolType) => {
    if (!onAddAnnotation) return

    const tool = toolType || activeTool
    const basePosition = { x: 50, y: 50 } // Default center position

    let newAnnotation = {
      type: tool,
      position: basePosition,
    }

    switch (tool) {
      case "text":
        newAnnotation = {
          ...newAnnotation,
          content: "", // Start with empty content
          style: {
            fontSize,
            fontFamily,
            textAlign,
            color,
            bold: textFormatting.bold,
            italic: textFormatting.italic,
            underline: textFormatting.underline,
            strikethrough: textFormatting.strikethrough,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }
        break
      case "rectangle":
        newAnnotation = {
          ...newAnnotation,
          width: 100,
          height: 50,
          style: {
            stroke: outlineColor,
            strokeWidth: lineWidth,
            fill: color,
          },
        }
        break
      case "ellipse":
        newAnnotation = {
          ...newAnnotation,
          radius: 50,
          style: {
            stroke: outlineColor,
            strokeWidth: lineWidth,
            fill: color,
          },
        }
        break
      case "line":
      case "freehand":
        // For freehand and line, we'll create a simple line
        newAnnotation = {
          ...newAnnotation,
          points: [0, 0, 100, 100],
          style: {
            stroke: outlineColor,
            strokeWidth: lineWidth,
          },
        }
        break
      case "arrow":
        newAnnotation = {
          ...newAnnotation,
          points: [0, 0, 100, 100],
          style: {
            stroke: outlineColor,
            strokeWidth: lineWidth,
          },
        }
        break
      case "eraser":
        // Eraser is a special tool that doesn't create annotations
        return
      default:
        return
    }

    // Add the annotation
    const createdAnnotation = { ...newAnnotation, id: Date.now() }
    onAddAnnotation(createdAnnotation)

    // Select the new annotation
    setSelectedAnnotation(createdAnnotation.id)

    // If it's a text annotation, show the editor immediately
    if (tool === "text") {
      setEditingAnnotationId(createdAnnotation.id)
    }
  }

  const toggleTextFormatting = (type) => {
    setTextFormatting((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))

    // If an annotation is selected, update it
    if (selectedAnnotation && onUpdateAnnotation) {
      const annotation = annotations.find((a) => a.id === selectedAnnotation)
      if (annotation && annotation.type === "text") {
        // Also update the editor if it exists
        if (editor) {
          switch (type) {
            case "bold":
              editor.chain().focus().toggleBold().run()
              break
            case "italic":
              editor.chain().focus().toggleItalic().run()
              break
            case "underline":
              editor.chain().focus().toggleUnderline().run()
              break
            case "strikethrough":
              editor.chain().focus().toggleStrike().run()
              break
          }
        }

        onUpdateAnnotation(selectedAnnotation, {
          style: {
            ...annotation.style,
            [type]: !textFormatting[type],
          },
        })
      }
    }
  }

  // Update the handleApplyTiptap function to handle empty text
  const handleApplyTiptap = () => {
    if (!editor || !selectedAnnotation) return

    const content = editor.getHTML()

    // Get the current state of formatting from the editor
    const bold = editor.isActive("bold")
    const italic = editor.isActive("italic")
    const underline = editor.isActive("underline")
    const strikethrough = editor.isActive("strike")

    // Update the text formatting state to match
    setTextFormatting({
      bold,
      italic,
      underline,
      strikethrough,
    })

    // Update the annotation with the new content and style
    onUpdateAnnotation(selectedAnnotation, {
      content: content, // Allow empty content
      style: {
        fontSize,
        fontFamily,
        textAlign,
        color,
        bold,
        italic,
        underline,
        strikethrough,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
    })

    // Force a redraw of the stage
    setTimeout(() => {
      if (stageRef && stageRef.current) {
        stageRef.current.batchDraw()
      }
    }, 50)

    setShowTiptap(false)
  }

  // Update selected annotation
  const updateSelectedAnnotation = () => {
    if (!selectedAnnotation || !onUpdateAnnotation) return

    const annotation = annotations.find((a) => a.id === selectedAnnotation)
    if (!annotation) return

    let updatedProps = {}

    if (annotation.type === "text") {
      updatedProps = {
        style: {
          ...annotation.style,
          fontSize,
          fontFamily,
          textAlign,
          color,
          bold: textFormatting.bold,
          italic: textFormatting.italic,
          underline: textFormatting.underline,
          strikethrough: textFormatting.strikethrough,
        },
      }
    } else {
      updatedProps = {
        style: {
          ...annotation.style,
          stroke: outlineColor,
          strokeWidth: lineWidth,
          fill: annotation.type !== "line" && annotation.type !== "arrow" ? color : undefined,
        },
      }
    }

    onUpdateAnnotation(selectedAnnotation, updatedProps)
  }

  // Delete selected annotation
  const deleteSelectedAnnotation = () => {
    if (selectedAnnotation && onDeleteAnnotation) {
      onDeleteAnnotation(selectedAnnotation)
      setSelectedAnnotation(null)
    }
  }



  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputFocused =
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.getAttribute("contenteditable") === "true"
  
      // Prevent global delete when editing text
      if (e.key === "Delete" || e.key === "Backspace") {
        if (isInputFocused) {
          // Let the editor handle it
          e.stopPropagation()
          return
        }
  
        // Your custom logic for deletion outside of input
        if (selectedAnnotation) {
          onDeleteAnnotation(selectedAnnotation)
          setSelectedAnnotation(null)
        }
      }
    }
  
    window.addEventListener("keydown", handleKeyDown)
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedAnnotation])
  

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
          <TabsTrigger
            value="text"
            disabled={
              activeTool !== "text" &&
              !(selectedAnnotation && annotations.find((a) => a.id === selectedAnnotation)?.type === "text")
            }
          >
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
                  {align.icon}
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

      {/* Tiptap Editor for text annotations */}
      {editingAnnotationId && selectedAnnotation === editingAnnotationId && editor && (
        <div ref={tiptapContainerRef} className="mt-4 border border-gray-700 rounded-md bg-gray-800 overflow-hidden">
          <div className="flex gap-1 bg-gray-900 p-2">
            <Button
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="icon"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="h-8 w-8"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="icon"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="h-8 w-8"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("underline") ? "secondary" : "ghost"}
              size="icon"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="h-8 w-8"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("strike") ? "secondary" : "ghost"}
              size="icon"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className="h-8 w-8"
            >
              <StrikethroughIcon className="h-4 w-4" />
            </Button>
            <div className="border-l border-gray-700 mx-1"></div>
            <Button
              variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
              size="icon"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className="h-8 w-8"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
              size="icon"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className="h-8 w-8"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
              size="icon"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className="h-8 w-8"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <div className="border-l border-gray-700 mx-1"></div>
            <Input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value)
                editor.chain().focus().setColor(e.target.value).run()
              }}
              className="w-8 h-8 p-1"
            />
          </div>
          <EditorContent editor={editor} className="bg-gray-800" />
          <div className="flex justify-end p-2 bg-gray-900">
            <Button size="sm" variant="ghost" onClick={() => setEditingAnnotationId(null)} className="mr-2">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleApplyTiptap()
                setEditingAnnotationId(null)
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-800 space-y-2">
        {selectedAnnotation ? (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={updateSelectedAnnotation}>
              Update Annotation
            </Button>
            <Button variant="destructive" onClick={deleteSelectedAnnotation}>
              Delete
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={() => createAnnotation()}>
            Add {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Annotation
          </Button>
        )}
      </div>
    </div>
  )
}

export default AnnotateControls
