import { useState, useEffect, useRef } from "react"
import { MARKER_OPTIONS } from "../../../../lib/constants"

const MediaPreview = ({
  mediaRef,
  canvasRef,
  mediaType,
  mediaUrl,
  stickers = [],
  annotations = [],
  zoom,
  onUpdateSticker,
  onDeleteSticker,
  onUpdateAnnotation,
  onDeleteAnnotation,
  activeTool,
}) => {
  const [activeSticker, setActiveSticker] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [containerRect, setContainerRect] = useState(null)
  const containerRef = useRef(null)
  const [activeTextEditor, setActiveTextEditor] = useState(null)
  const textInputRef = useRef(null)

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!mediaRef.current || !canvasRef.current) return;
  
      const mediaElement = mediaRef.current;
      const canvas = canvasRef.current;
  
      const rect = mediaElement.getBoundingClientRect();
  
      canvas.width = rect.width;
      canvas.height = rect.height;
  
      canvas.style.position = "absolute";
      canvas.style.left = `${mediaElement.offsetLeft}px`;
      canvas.style.top = `${mediaElement.offsetTop}px`;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
  
      setContainerRect(rect); // store actual media rect
    };
  
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [mediaRef, canvasRef]);
  

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace" && activeSticker !== null && onDeleteSticker) {
        onDeleteSticker(activeSticker)
        setActiveSticker(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeSticker, onDeleteSticker])

  // Handle text editor focus
  useEffect(() => {
    if (activeTextEditor && textInputRef.current) {
      textInputRef.current.focus()
    }
  }, [activeTextEditor])

  const handleStickerClick = (index, e) => {
    e.stopPropagation()
    setActiveSticker(index)
  }

  const handleContainerClick = () => {
    // Only clear selection if not in annotation mode
    if (activeTool !== "annotate") {
      setActiveSticker(null)
      setActiveTextEditor(null)
    }
  }

  const handleMouseDown = (e, index) => {
    if (activeSticker !== index) return

    e.stopPropagation()
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })

    const container = e.currentTarget.closest(".relative")
    if (container) {
      setContainerRect(container.getBoundingClientRect())
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging || activeSticker === null || !containerRect || !onUpdateSticker) return

    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y

    const sticker = { ...stickers[activeSticker] }

    const newX = sticker.position.x + (deltaX / containerRect.width) * 100
    const newY = sticker.position.y + (deltaY / containerRect.height) * 100

    const clampedX = Math.max(0, Math.min(100, newX))
    const clampedY = Math.max(0, Math.min(100, newY))

    onUpdateSticker(activeSticker, {
      ...sticker,
      position: { x: clampedX, y: clampedY },
    })

    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleResize = (index, deltaX, deltaY) => {
    if (!onUpdateSticker) return

    const sticker = { ...stickers[index] }
    const scaleFactor = Math.max(deltaX, deltaY)
    const newSize = sticker.size + scaleFactor

    const minSize = 10
    const finalSize = Math.max(minSize, newSize)

    onUpdateSticker(index, {
      ...sticker,
      size: finalSize,
    })
  }

  // Handle text annotation click
  const handleTextAnnotationClick = (id, e) => {
    e.stopPropagation()
    setActiveTextEditor(id)
  }

  // Handle text change
  const handleTextChange = (e, id) => {
    if (!onUpdateAnnotation) return

    onUpdateAnnotation(id, {
      content: e.target.value,
    })
  }

  // Add placeholder and make text editor resizable
  const renderTextAnnotations = () => {
    return annotations
      .filter((a) => a.type === "text")
      .map((annotation) => (
        <div
          key={`text-${annotation.id}`}
          style={{
            position: "absolute",
            left: `${annotation.position.x}%`,
            top: `${annotation.position.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            cursor: "move",
            padding: "4px",
            border: activeTextEditor === annotation.id ? "2px dashed #3b82f6" : "2px solid transparent",
            borderRadius: "4px",
            minWidth: "100px",
            minHeight: "40px",
            resize: "both",
            overflow: "auto",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background for better visibility
          }}
          onClick={(e) => handleTextAnnotationClick(annotation.id, e)}
          onMouseDown={(e) => {
            if (activeTextEditor === annotation.id) {
              e.stopPropagation()
              const startX = e.clientX
              const startY = e.clientY

              const handleMoveAnnotation = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX
                const deltaY = moveEvent.clientY - startY

                if (containerRect) {
                  const newX = annotation.position.x + (deltaX / containerRect.width) * 100
                  const newY = annotation.position.y + (deltaY / containerRect.height) * 100

                  onUpdateAnnotation(annotation.id, {
                    ...annotation,
                    position: {
                      x: Math.max(0, Math.min(100, newX)),
                      y: Math.max(0, Math.min(100, newY)),
                    },
                  })
                }

                document.removeEventListener("mousemove", handleMoveAnnotation)
                document.removeEventListener("mouseup", handleMoveUp)
              }

              const handleMoveUp = () => {
                document.removeEventListener("mousemove", handleMoveAnnotation)
                document.removeEventListener("mouseup", handleMoveUp)
              }

              document.addEventListener("mousemove", handleMoveAnnotation)
              document.addEventListener("mouseup", handleMoveUp)
            }
          }}
        >
          {activeTextEditor === annotation.id ? (
            <textarea
              ref={textInputRef}
              value={annotation.content || ""}
              onChange={(e) => handleTextChange(e, annotation.id)}
              className="bg-transparent text-white border-none outline-none resize-none w-full h-full"
              style={{
                fontSize: `${annotation.style?.fontSize || 24}px`,
                fontFamily: annotation.style?.fontFamily || "sans-serif",
                fontWeight: annotation.style?.bold ? "bold" : "normal",
                fontStyle: annotation.style?.italic ? "italic" : "normal",
                textDecoration: annotation.style?.underline ? "underline" : "none",
              }}
              placeholder="Enter text here"
            />
          ) : (
            <div
              className="text-white whitespace-pre-wrap w-full h-full"
              style={{
                fontSize: `${annotation.style?.fontSize || 24}px`,
                fontFamily: annotation.style?.fontFamily || "sans-serif",
                fontWeight: annotation.style?.bold ? "bold" : "normal",
                fontStyle: annotation.style?.italic ? "italic" : "normal",
                textDecoration: annotation.style?.underline ? "underline" : "none",
              }}
            >
              {annotation.content || <span className="text-gray-400 italic">Enter text here</span>}
            </div>
          )}
        </div>
      ))
  }

  // Handle keydown for deleting text annotations
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace" && activeTextEditor !== null && onDeleteAnnotation) {
        onDeleteAnnotation(activeTextEditor)
        setActiveTextEditor(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTextEditor, onDeleteAnnotation])

  return (
    <div className="flex-1 overflow-auto bg-[#1A1A1A]" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="h-full w-full flex items-center justify-center p-4">
        <div
          ref={containerRef}
          className="relative"
          style={{
            transform: `scale(${zoom / 100})`,
            transition: "transform 0.2s",
          }}
          onClick={handleContainerClick}
        >
          {/* Stickers */}
          {stickers.map((sticker, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${sticker.position.x}%`,
                top: `${sticker.position.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${sticker.size}px`,
                width: sticker.type === "image" ? `${sticker.size}px` : "auto",
                height: sticker.type === "image" ? `${sticker.size}px` : "auto",
                zIndex: 10,
                cursor: activeSticker === index ? "move" : "pointer",
                padding: "4px",
                border: activeSticker === index ? "2px dashed #3b82f6" : "none",
                borderRadius: "4px",
              }}
              onClick={(e) => handleStickerClick(index, e)}
              onMouseDown={(e) => handleMouseDown(e, index)}
              tabIndex={0}
            >
              {sticker.type === "emoji" && sticker.content}
              {sticker.type === "image" && (
                <img
                  src={sticker.content || "/placeholder.svg"}
                  alt="Sticker"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    pointerEvents: "none",
                  }}
                />
              )}
              {sticker.type === "text" && (
                <span className="text-white whitespace-nowrap" style={{ pointerEvents: "none" }}>
                  {sticker.content}
                </span>
              )}
              {sticker.type === "marker" && (
                <div className="text-white" style={{ pointerEvents: "none" }}>
                  {MARKER_OPTIONS.find((m) => m.id === sticker.content)?.icon || ""}
                </div>
              )}

              {activeSticker === index && (
                <div
                  className="absolute -right-4 -bottom-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-nwse-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const startX = e.clientX
                    const startY = e.clientY

                    const handleResizeMove = (moveEvent) => {
                      const deltaX = moveEvent.clientX - startX
                      const deltaY = moveEvent.clientY - startY
                      handleResize(index, deltaX, deltaY)
                    }

                    const handleResizeUp = () => {
                      document.removeEventListener("mousemove", handleResizeMove)
                      document.removeEventListener("mouseup", handleResizeUp)
                    }

                    document.addEventListener("mousemove", handleResizeMove)
                    document.addEventListener("mouseup", handleResizeUp)
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 15V21H15"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 21L14 14"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Text Annotations */}
          {renderTextAnnotations()}

          {/* Media Element */}
          {mediaType === "video" ? (
            <video ref={mediaRef} src={mediaUrl} className="max-h-full max-w-full object-contain" loop />
          ) : (
            <img
              ref={mediaRef}
              src={mediaUrl || "/placeholder.svg"}
              className="max-h-full max-w-full object-contain"
              alt="Media to edit"
            />
          )}

          {/* Canvas for drawing */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              display: "block",
              zIndex: 15,
              pointerEvents: activeTool === "annotate" ? "auto" : "none",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MediaPreview
