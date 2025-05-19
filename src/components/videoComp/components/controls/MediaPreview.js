"use client"

import { useState, useEffect, useRef } from "react"
import { Stage, Layer, Text, Rect, Circle, Line, Arrow, Transformer, Image as KonvaImage, Group } from "react-konva"
import { MARKER_OPTIONS } from "../../../../lib/constants"
import useImage from "../hooks/use-image"
import InlineTextEditor from "../inline-text-editor"

// Custom Emoji component for Konva
const EmojiSticker = ({ sticker, isSelected, onSelect, onChange, stageSize }) => {
  const shapeRef = useRef()
  const trRef = useRef()

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Attach transformer to the sticker
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const handleDragEnd = (e) => {
    // Get the stage and node
    const stage = e.target.getStage()
    const node = e.target

    // Calculate position as percentage of stage size
    // Constrain the position to keep the sticker within bounds
    const nodeWidth = node.width() * node.scaleX()
    const nodeHeight = node.height() * node.scaleY()

    // Calculate the half-size of the sticker for centering
    const halfWidth = nodeWidth / 2
    const halfHeight = nodeHeight / 2

    // Constrain x and y to keep the sticker within the stage
    const x = Math.max(halfWidth, Math.min(stage.width() - halfWidth, node.x()))
    const y = Math.max(halfHeight, Math.min(stage.height() - halfHeight, node.y()))

    // Set the constrained position
    node.position({ x, y })

    // Convert to percentage for storage
    const xPercent = (x / stage.width()) * 100
    const yPercent = (y / stage.height()) * 100

    onChange({
      ...sticker,
      position: { x: xPercent, y: yPercent },
    })
  }

  const handleTransformEnd = (e) => {
    // Get the node reference
    const node = shapeRef.current

    // Calculate new size based on scale
    const scaleX = node.scaleX()
    const newSize = sticker.size * scaleX

    // Update with new size and reset scale
    onChange({
      ...sticker,
      size: newSize,
    })

    // Reset scale to 1 after applying it to size
    node.scaleX(1)
    node.scaleY(1)
  }

  // Calculate font size based on sticker size
  const fontSize = sticker.size

  return (
    <>
      <Text
        ref={shapeRef}
        text={sticker.content}
        x={(sticker.position.x * stageSize.width) / 100}
        y={(sticker.position.y * stageSize.height) / 100}
        fontSize={fontSize}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        // Center the emoji
        offsetX={fontSize / 2}
        offsetY={fontSize / 2}
        dragBoundFunc={(pos) => {
          // Calculate bounds based on font size
          const halfSize = fontSize / 2

          // Constrain position to stage boundaries
          return {
            x: Math.max(halfSize, Math.min(stageSize.width - halfSize, pos.x)),
            y: Math.max(halfSize, Math.min(stageSize.height - halfSize, pos.y)),
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox
            }

            // Ensure the sticker stays within the stage boundaries
            const maxX = stageSize.width
            const maxY = stageSize.height

            // Check if any part of the box is outside the stage
            if (newBox.x < 0 || newBox.y < 0 || newBox.x + newBox.width > maxX || newBox.y + newBox.height > maxY) {
              return oldBox
            }

            return newBox
          }}
        />
      )}
    </>
  )
}

// Custom Image Sticker component for Konva
const ImageSticker = ({ sticker, isSelected, onSelect, onChange, stageSize }) => {
  const shapeRef = useRef()
  const trRef = useRef()
  const [image] = useImage(sticker.content)

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const handleDragEnd = (e) => {
    const stage = e.target.getStage()
    const node = e.target

    // Calculate the bounds to keep the sticker within the stage
    const halfWidth = (sticker.size * node.scaleX()) / 2
    const halfHeight = (sticker.size * node.scaleY()) / 2

    // Constrain x and y
    const x = Math.max(halfWidth, Math.min(stage.width() - halfWidth, node.x()))
    const y = Math.max(halfHeight, Math.min(stage.height() - halfHeight, node.y()))

    // Set the constrained position
    node.position({ x, y })

    // Convert to percentage for storage
    const xPercent = (x / stage.width()) * 100
    const yPercent = (y / stage.height()) * 100

    onChange({
      ...sticker,
      position: { x: xPercent, y: yPercent },
    })
  }

  const handleTransformEnd = (e) => {
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const newSize = sticker.size * scaleX

    onChange({
      ...sticker,
      size: newSize,
    })

    node.scaleX(1)
    node.scaleY(1)
  }

  if (!image) return null

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={(sticker.position.x * stageSize.width) / 100}
        y={(sticker.position.y * stageSize.height) / 100}
        width={sticker.size}
        height={sticker.size}
        offsetX={sticker.size / 2}
        offsetY={sticker.size / 2}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        dragBoundFunc={(pos) => {
          // Calculate bounds based on image size
          const halfSize = sticker.size / 2

          // Constrain position to stage boundaries
          return {
            x: Math.max(halfSize, Math.min(stageSize.width - halfSize, pos.x)),
            y: Math.max(halfSize, Math.min(stageSize.height - halfSize, pos.y)),
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox
            }

            // Ensure the sticker stays within the stage boundaries
            const maxX = stageSize.width
            const maxY = stageSize.height

            // Check if any part of the box is outside the stage
            if (newBox.x < 0 || newBox.y < 0 || newBox.x + newBox.width > maxX || newBox.y + newBox.height > maxY) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

// Custom Marker component for Konva
const MarkerSticker = ({ sticker, isSelected, onSelect, onChange, stageSize }) => {
  const shapeRef = useRef()
  const trRef = useRef()
  const marker = MARKER_OPTIONS.find((m) => m.id === sticker.content)

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const handleDragEnd = (e) => {
    const stage = e.target.getStage()
    const node = e.target

    // For markers, use the size as the diameter
    const radius = sticker.size / 2

    // Constrain x and y
    const x = Math.max(radius, Math.min(stage.width() - radius, node.x()))
    const y = Math.max(radius, Math.min(stage.height() - radius, node.y()))

    // Set the constrained position
    node.position({ x, y })

    // Convert to percentage for storage
    const xPercent = (x / stage.width()) * 100
    const yPercent = (y / stage.height()) * 100

    onChange({
      ...sticker,
      position: { x: xPercent, y: yPercent },
    })
  }

  const handleTransformEnd = (e) => {
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const newSize = sticker.size * scaleX

    onChange({
      ...sticker,
      size: newSize,
    })

    node.scaleX(1)
    node.scaleY(1)
  }

  if (!marker) return null

  return (
    <>
      <Group
        ref={shapeRef}
        x={(sticker.position.x * stageSize.width) / 100}
        y={(sticker.position.y * stageSize.height) / 100}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        dragBoundFunc={(pos) => {
          // Calculate bounds based on marker size
          const radius = sticker.size / 2

          // Constrain position to stage boundaries
          return {
            x: Math.max(radius, Math.min(stageSize.width - radius, pos.x)),
            y: Math.max(radius, Math.min(stageSize.height - radius, pos.y)),
          }
        }}
      >
        <Circle radius={sticker.size / 2} fill="rgba(0, 0, 0, 0.5)" stroke="#ffffff" strokeWidth={2} />
        <Text
          text={marker.icon}
          fontSize={sticker.size * 0.6}
          fill="#ffffff"
          align="center"
          verticalAlign="middle"
          width={sticker.size}
          height={sticker.size}
          offsetX={sticker.size / 2}
          offsetY={sticker.size / 2}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox
            }

            // Ensure the sticker stays within the stage boundaries
            const maxX = stageSize.width
            const maxY = stageSize.height

            // Check if any part of the box is outside the stage
            if (newBox.x < 0 || newBox.y < 0 || newBox.x + newBox.width > maxX || newBox.y + newBox.height > maxY) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

// Custom Text Annotation component
const TextAnnotation = ({ annotation, isSelected, onClick, onDragEnd, onTransformEnd, stageSize }) => {
  const textRef = useRef(null)

  // Extract text content from HTML or use empty string
  const extractTextContent = (htmlContent) => {
    if (htmlContent === undefined || htmlContent === null) return ""
    // Remove HTML tags and decode entities
    return htmlContent.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ")
  }

  // Get the text content to display
  const displayText = extractTextContent(annotation.content)

  // Calculate position
  const x = (annotation.position?.x / 100) * stageSize.width
  const y = (annotation.position?.y / 100) * stageSize.height

  return (
    <Text
      ref={textRef}
      id={`annotation-${annotation.id}`}
      x={x}
      y={y}
      text={displayText} // Use the extracted text content
      fontSize={annotation.style?.fontSize || 24}
      fontFamily={annotation.style?.fontFamily || "sans-serif"}
      fontStyle={annotation.style?.italic ? "italic" : "normal"}
      fontWeight={annotation.style?.bold ? "bold" : "normal"}
      textDecoration={annotation.style?.underline ? "underline" : undefined}
      fill={annotation.style?.color || "#FFFFFF"}
      align={annotation.style?.textAlign || "left"}
      padding={5}
      draggable
      onClick={onClick}
      onTap={onClick}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      stroke={annotation.style?.stroke || undefined}
      strokeWidth={annotation.style?.strokeWidth || undefined}
    />
  )
}

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
  cropRegion,
  onCropRegionChange,
  showCropSelector,
  selectedAnnotation,
  setSelectedAnnotation,
  editingAnnotationId,
  setEditingAnnotationId,
  containerRef,
  mediaDimensions,
  updateMediaDimensions,
  stageRef,
}) => {
  const [selectedStickerId, setSelectedStickerId] = useState(null)
  const [activeAnnotation, setActiveAnnotation] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [containerRect, setContainerRect] = useState(null)
  const mediaContainerRef = useRef(null)
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState(null)
  const [localCropRegion, setLocalCropRegion] = useState(
    cropRegion || {
      x: 20,
      y: 20,
      width: 60,
      height: 60,
    },
  )
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const localStageRef = useRef(null)
  const layerRef = useRef(null)
  const transformerRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState([])
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [editingTextAnnotation, setEditingTextAnnotation] = useState(null)
  const [currentDrawingTool, setCurrentDrawingTool] = useState(null)
  const [isErasing, setIsErasing] = useState(false)

  // Update stage size when media dimensions change
  useEffect(() => {
    if (mediaDimensions && mediaDimensions.width && mediaDimensions.height) {
      setStageSize({
        width: mediaDimensions.width,
        height: mediaDimensions.height,
      })
    }
  }, [mediaDimensions])

  // Update canvas size when media element changes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!mediaRef.current || !mediaContainerRef.current) return

      const mediaElement = mediaRef.current
      const rect = mediaElement.getBoundingClientRect()

      setStageSize({
        width: rect.width,
        height: rect.height,
      })

      setContainerRect(rect)

      // Call the parent's updateMediaDimensions if available
      if (updateMediaDimensions) {
        updateMediaDimensions()
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    if (mediaRef.current) {
      if (mediaType === "video") {
        mediaRef.current.addEventListener("loadedmetadata", updateCanvasSize)
      } else {
        mediaRef.current.addEventListener("load", updateCanvasSize)
      }
    }

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      if (mediaRef.current) {
        if (mediaType === "video") {
          mediaRef.current.removeEventListener("loadedmetadata", updateCanvasSize)
        } else {
          mediaRef.current.removeEventListener("load", updateCanvasSize)
        }
      }
    }
  }, [mediaRef, mediaType, updateMediaDimensions])

  useEffect(() => {
    if (cropRegion) setLocalCropRegion(cropRegion)
  }, [cropRegion])

  // Handle keyboard events for deletion
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === "Backspace" || e.key === "Delete") {
  //       if (selectedStickerId !== null && onDeleteSticker) {
  //         const stickerIndex = stickers.findIndex((s) => s.id === selectedStickerId)
  //         if (stickerIndex !== -1) {
  //           onDeleteSticker(stickerIndex)
  //           setSelectedStickerId(null)
  //         }
  //       }
  //       if (activeAnnotation !== null && onDeleteAnnotation) {
  //         onDeleteAnnotation(activeAnnotation)
  //         setActiveAnnotation(null)
  //       }
  //     }
  //   }

  //   window.addEventListener("keydown", handleKeyDown)
  //   return () => window.removeEventListener("keydown", handleKeyDown)
  // }, [selectedStickerId, activeAnnotation, onDeleteSticker, onDeleteAnnotation, stickers])

  // Update transformer when active annotation changes
  useEffect(() => {
    if (!transformerRef.current || !layerRef.current) return

    if (activeAnnotation !== null && !showTextEditor) {
      const node = layerRef.current.findOne(`#annotation-${activeAnnotation}`)
      if (node) {
        transformerRef.current.nodes([node])
        transformerRef.current.getLayer().batchDraw()
      } else {
        transformerRef.current.nodes([])
      }
    } else {
      transformerRef.current.nodes([])
    }
  }, [activeAnnotation, annotations, showTextEditor])

  // Update current drawing tool when selected annotation changes
  useEffect(() => {
    if (selectedAnnotation) {
      const annotation = annotations.find((a) => a.id === selectedAnnotation)
      if (annotation) {
        setCurrentDrawingTool(annotation.type)
        setIsErasing(annotation.type === "eraser")
      }
    }
  }, [selectedAnnotation, annotations])

  const handleStickerSelect = (stickerId) => {
    setSelectedStickerId(stickerId)
    setActiveAnnotation(null)
    setShowTextEditor(false)
  }

  const handleAnnotationClick = (id) => {
    const annotation = annotations.find((a) => a.id === id)

    if (annotation && annotation.type === "text") {
      // For text annotations, show the inline editor
      setEditingTextAnnotation(annotation)
      setShowTextEditor(true)
      setActiveAnnotation(id)
      setEditingAnnotationId(id) // Make sure to set the editing ID
    } else {
      // For other annotations, just select them
      if (onUpdateAnnotation) {
        onUpdateAnnotation(id, { selected: true })
      }
      setActiveAnnotation(id)
      setShowTextEditor(false)
    }

    setSelectedStickerId(null)
  }

  const handleContainerClick = (e) => {
    // Only clear selection if clicking on the container background
    if (e.target === e.currentTarget && activeTool !== "annotate") {
      setSelectedStickerId(null)
      setActiveAnnotation(null)
      setShowTextEditor(false)
    }
  }

  const handleStickerChange = (updatedSticker) => {
    if (!onUpdateSticker) return

    const stickerIndex = stickers.findIndex((s) => s.id === updatedSticker.id)
    if (stickerIndex !== -1) {
      onUpdateSticker(stickerIndex, updatedSticker)
    }
  }

  // Crop mouse handlers
  const handleCropMouseDown = (e) => {
    if (activeTool !== "crop" || !mediaRef.current) return
    e.stopPropagation()

    // Get the media element's bounds
    const mediaElement = mediaRef.current
    const mediaRect = mediaElement.getBoundingClientRect()

    // Calculate the click position relative to the media element
    const clickX = e.clientX - mediaRect.left
    const clickY = e.clientY - mediaRect.top

    // Convert to percentage of media dimensions
    const x = (clickX / mediaRect.width) * 100
    const y = (clickY / mediaRect.height) * 100

    // Ensure we're within the media bounds
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      setIsCropping(true)
      setCropStart({ x, y })
      setLocalCropRegion({ x, y, width: 0, height: 0 })
    }
  }

  const handleCropMouseMove = (e) => {
    if (!isCropping || activeTool !== "crop" || !cropStart || !mediaRef.current) return

    // Get the media element's bounds
    const mediaElement = mediaRef.current
    const mediaRect = mediaElement.getBoundingClientRect()

    // Calculate the current position relative to the media element
    const currentX = Math.max(0, Math.min(100, ((e.clientX - mediaRect.left) / mediaRect.width) * 100))
    const currentY = Math.max(0, Math.min(100, ((e.clientY - mediaRect.top) / mediaRect.height) * 100))

    const newRegion = {
      x: Math.min(cropStart.x, currentX),
      y: Math.min(cropStart.y, currentY),
      width: Math.abs(currentX - cropStart.x),
      height: Math.abs(currentY - cropStart.y),
    }

    setLocalCropRegion(newRegion)
    if (onCropRegionChange) onCropRegionChange(newRegion)
  }

  const handleCropMouseUp = () => {
    if (isCropping && activeTool === "crop") {
      setIsCropping(false)
      setCropStart(null)
      if (onCropRegionChange) onCropRegionChange(localCropRegion)
    }
  }

  // Handle annotation drag
  const handleAnnotationDragEnd = (id, e) => {
    if (!containerRect || !onUpdateAnnotation) return

    const annotation = annotations.find((a) => a.id === id)
    if (!annotation) return

    // Make sure e.target exists and has x() and y() methods
    if (!e.target || typeof e.target.x !== "function" || typeof e.target.y !== "function") return

    const newX = (e.target.x() / stageSize.width) * 100
    const newY = (e.target.y() / stageSize.height) * 100

    onUpdateAnnotation(id, {
      ...annotation,
      position: { x: newX, y: newY },
    })
  }

  // Handle annotation transform
  const handleAnnotationTransform = (id, e) => {
    if (!onUpdateAnnotation) return

    const annotation = annotations.find((a) => a.id === id)
    if (!annotation) return

    const node = e.target
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    // Update based on annotation type
    if (annotation.type === "text") {
      onUpdateAnnotation(id, {
        ...annotation,
        style: {
          ...annotation.style,
          fontSize: annotation.style.fontSize * scaleX,
        },
        // Reset scale after applying it to fontSize
        scale: { x: 1, y: 1 },
      })
    } else if (annotation.type === "rectangle" || annotation.type === "ellipse") {
      // Get the current width and height
      const currentWidth = annotation.width || 100
      const currentHeight = annotation.height || 50

      // Calculate new dimensions based on scale
      const newWidth = currentWidth * scaleX
      const newHeight = currentHeight * scaleY

      // Apply reasonable limits to prevent excessive expansion
      const maxWidth = stageSize.width * 0.9
      const maxHeight = stageSize.height * 0.9

      onUpdateAnnotation(id, {
        ...annotation,
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight),
        // Reset scale after applying it to width/height
        scale: { x: 1, y: 1 },
      })
    } else if (annotation.type === "line" || annotation.type === "arrow" || annotation.type === "freehand") {
      // For lines and arrows, we need to scale the points
      const points = annotation.points.map((point, index) => {
        return index % 2 === 0 ? point * scaleX : point * scaleY
      })

      onUpdateAnnotation(id, {
        ...annotation,
        points,
        // Reset scale after applying it to points
        scale: { x: 1, y: 1 },
      })
    }
  }

  // Improved eraser functionality
  const handleEraserAction = (e) => {
    if (activeTool !== "annotate" || !isErasing) return

    // Get the stage and pointer position
    const stage = localStageRef.current || stageRef?.current
    if (!stage) return

    const pointerPos = stage.getPointerPosition()
    if (!pointerPos) return

    // Find annotations that intersect with the eraser
    const toDelete = []

    annotations.forEach((annotation) => {
      // Skip the eraser tool itself
      if (annotation.type === "eraser" || annotation.id === selectedAnnotation) return

      // For line/freehand, check if any point is close to the eraser
      if (
        (annotation.type === "line" || annotation.type === "freehand") &&
        annotation.points &&
        annotation.points.length >= 2
      ) {
        // Convert position to absolute coordinates
        const absX = (annotation.position?.x / 100) * stageSize.width || 0
        const absY = (annotation.position?.y / 100) * stageSize.height || 0

        // Check each line segment
        for (let i = 0; i < annotation.points.length - 2; i += 2) {
          const x1 = absX + annotation.points[i]
          const y1 = absY + annotation.points[i + 1]
          const x2 = absX + annotation.points[i + 2]
          const y2 = absY + annotation.points[i + 3]

          // Calculate distance from point to line segment
          const distance = distanceToLineSegment(pointerPos.x, pointerPos.y, x1, y1, x2, y2)

          // If close enough, mark for deletion
          if (distance < 20) {
            // Increased threshold for easier erasing
            toDelete.push(annotation.id)
            break
          }
        }
      }
      // For other shapes, check if the eraser is inside the shape
      else if (annotation.type === "rectangle" || annotation.type === "ellipse" || annotation.type === "text") {
        const absX = (annotation.position?.x / 100) * stageSize.width || 0
        const absY = (annotation.position?.y / 100) * stageSize.height || 0

        let isInside = false

        if (annotation.type === "rectangle") {
          const width = annotation.width || 100
          const height = annotation.height || 50
          isInside =
            pointerPos.x >= absX - width / 2 &&
            pointerPos.x <= absX + width / 2 &&
            pointerPos.y >= absY - height / 2 &&
            pointerPos.y <= absY + height / 2
        } else if (annotation.type === "ellipse") {
          const radius = annotation.radius || 50
          const dx = pointerPos.x - absX
          const dy = pointerPos.y - absY
          isInside = Math.sqrt(dx * dx + dy * dy) <= radius
        } else if (annotation.type === "text") {
          // Approximate text area
          const fontSize = annotation.style?.fontSize || 24
          const textWidth = (annotation.content?.length || 1) * fontSize * 0.6
          const textHeight = fontSize * 1.2
          isInside =
            pointerPos.x >= absX - textWidth / 2 &&
            pointerPos.x <= absX + textWidth / 2 &&
            pointerPos.y >= absY - textHeight / 2 &&
            pointerPos.y <= absY + textHeight / 2
        }

        if (isInside) {
          toDelete.push(annotation.id)
        }
      }
    })

    // Delete all marked annotations
    toDelete.forEach((id) => {
      if (onDeleteAnnotation) {
        onDeleteAnnotation(id)
      }
    })
  }

  // Helper function to calculate distance from point to line segment
  const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = px - xx
    const dy = py - yy

    return Math.sqrt(dx * dx + dy * dy)
  }

  // Improved freehand drawing
  const handleStageMouseDown = (e) => {
    if (activeTool !== "annotate") return

    // Get the selected tool type
    const selectedTool = annotations.find((a) => a.id === selectedAnnotation)?.type

    // Handle eraser tool
    if (selectedTool === "eraser") {
      setIsErasing(true)
      handleEraserAction(e)
      return
    }

    // Only allow drawing if a drawing tool is selected
    if (selectedTool !== "line" && selectedTool !== "freehand" && selectedTool !== "pencil") {
      return
    }

    // Get pointer position relative to stage
    const stage = e.target.getStage()
    if (!stage) return

    const pointerPos = stage.getPointerPosition()
    if (!pointerPos) return

    // Store points as percentages of stage size for consistent scaling
    const pointX = (pointerPos.x / stageSize.width) * 100
    const pointY = (pointerPos.y / stageSize.height) * 100

    // Start drawing
    setIsDrawing(true)
    setDrawingPoints([pointX, pointY])
    setCurrentDrawingTool(selectedTool)
  }

  // Handle stage mouse move for drawing
  const handleStageMouseMove = (e) => {
    // Handle eraser tool
    if (activeTool === "annotate" && isErasing) {
      handleEraserAction(e)
      return
    }

    if (!isDrawing || activeTool !== "annotate") return

    // Get pointer position relative to stage
    const stage = e.target.getStage()
    if (!stage) return

    const pointerPos = stage.getPointerPosition()
    if (!pointerPos) return

    // Store points as percentages of stage size for consistent scaling
    const pointX = (pointerPos.x / stageSize.width) * 100
    const pointY = (pointerPos.y / stageSize.height) * 100

    // Add point to drawing
    setDrawingPoints([...drawingPoints, pointX, pointY])
  }

  // Handle stage mouse up for drawing
  const handleStageMouseUp = () => {
    // Stop erasing
    if (isErasing) {
      setIsErasing(false)
      return
    }

    if (!isDrawing || activeTool !== "annotate" || drawingPoints.length < 4) {
      setIsDrawing(false)
      return
    }

    // Get the selected tool type
    const selectedTool = currentDrawingTool || "freehand"

    // Create new annotation from drawing
    if (onUpdateAnnotation) {
      const newAnnotation = {
        id: Date.now(),
        type: selectedTool === "pencil" ? "freehand" : selectedTool,
        position: { x: 0, y: 0 },
        points: drawingPoints,
        style: {
          stroke: "#FFFFFF",
          strokeWidth: 2,
        },
      }

      if (onUpdateAnnotation) {
        onUpdateAnnotation(newAnnotation.id, newAnnotation)

        // Force a re-render of the canvas
        setTimeout(() => {
          if (localStageRef.current) {
            localStageRef.current.batchDraw()
          } else if (stageRef?.current) {
            stageRef.current.batchDraw()
          }
        }, 50)
      }
    }

    // Reset drawing state
    setIsDrawing(false)
    setDrawingPoints([])
  }

  // Make sure media is visible when switching tools
  useEffect(() => {
    if (mediaRef.current) {
      // Ensure media is always visible when switching tools
      mediaRef.current.style.visibility = "visible"
      mediaRef.current.style.opacity = "1"
    }

    // Update dimensions when tool changes
    if (activeTool === "crop" || activeTool === "sticker") {
      if (updateMediaDimensions) {
        updateMediaDimensions()
      }
    }
  }, [activeTool, mediaRef, updateMediaDimensions])

  // Add this function to the MediaPreview component to ensure stickers stay within bounds
  const ensureStickersWithinBounds = () => {
    if (!stageSize.width || !stageSize.height || !stickers.length || !onUpdateSticker) return

    stickers.forEach((sticker, index) => {
      let needsUpdate = false
      const newPosition = { ...sticker.position }

      // Calculate sticker size based on type
      const stickerSize = sticker.size || 50

      // Calculate half-size as percentage of stage
      const halfSizeX = (stickerSize / 2 / stageSize.width) * 100
      const halfSizeY = (stickerSize / 2 / stageSize.height) * 100

      // Check and adjust x position
      if (newPosition.x < halfSizeX) {
        newPosition.x = halfSizeX
        needsUpdate = true
      } else if (newPosition.x > 100 - halfSizeX) {
        newPosition.x = 100 - halfSizeX
        needsUpdate = true
      }

      // Check and adjust y position
      if (newPosition.y < halfSizeY) {
        newPosition.y = halfSizeY
        needsUpdate = true
      } else if (newPosition.y > 100 - halfSizeY) {
        newPosition.y = 100 - halfSizeY
        needsUpdate = true
      }

      // Update sticker if needed
      if (needsUpdate) {
        onUpdateSticker(index, { ...sticker, position: newPosition })
      }
    })
  }

  // Call this function whenever the stage size changes or stickers are updated
  useEffect(() => {
    ensureStickersWithinBounds()
  }, [stageSize, stickers])

  // Add a useEffect to ensure the stage is redrawn when annotations change
  useEffect(() => {
    if (localStageRef.current) {
      localStageRef.current.batchDraw()
    } else if (stageRef?.current) {
      stageRef.current.batchDraw()
    }
  }, [annotations, stickers, stageRef])

  // Render stickers and annotations using Konva
  const renderKonvaElements = () => {
    if (!stageSize.width || !stageSize.height) return null

    return (
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={(node) => {
          localStageRef.current = node
          if (stageRef) {
            stageRef.current = node
          }
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: activeTool === "annotate" || activeTool === "sticker" ? "auto" : "none",
        }}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleContainerClick}
      >
        <Layer ref={layerRef}>
          {/* Current drawing line */}
          {isDrawing && drawingPoints.length >= 4 && (
            <Line
              points={drawingPoints.map((point, index) => {
                // Convert percentage points back to actual coordinates for display
                return index % 2 === 0 ? (point / 100) * stageSize.width : (point / 100) * stageSize.height
              })}
              stroke="#FFFFFF"
              strokeWidth={2}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Stickers */}
          {stickers.map((sticker) => {
            const isSelected = selectedStickerId === sticker.id

            switch (sticker.type) {
              case "emoji":
                return (
                  <EmojiSticker
                    key={sticker.id}
                    sticker={sticker}
                    isSelected={isSelected}
                    onSelect={() => handleStickerSelect(sticker.id)}
                    onChange={handleStickerChange}
                    stageSize={stageSize}
                  />
                )
              case "image":
                return (
                  <ImageSticker
                    key={sticker.id}
                    sticker={sticker}
                    isSelected={isSelected}
                    onSelect={() => handleStickerSelect(sticker.id)}
                    onChange={handleStickerChange}
                    stageSize={stageSize}
                  />
                )
              case "marker":
                return (
                  <MarkerSticker
                    key={sticker.id}
                    sticker={sticker}
                    isSelected={isSelected}
                    onSelect={() => handleStickerSelect(sticker.id)}
                    onChange={handleStickerChange}
                    stageSize={stageSize}
                  />
                )
              default:
                return null
            }
          })}

          {/* Existing annotations */}
          {annotations.map((annotation) => {
            // Skip rendering eraser tool
            if (annotation.type === "eraser") return null

            // Skip rendering text annotation if it's being edited in the inline editor
            if (showTextEditor && editingTextAnnotation && editingTextAnnotation.id === annotation.id) {
              return null
            }

            // For text annotations, use our custom component
            if (annotation.type === "text") {
              return (
                <TextAnnotation
                  key={annotation.id}
                  annotation={annotation}
                  isSelected={activeAnnotation === annotation.id}
                  onClick={() => handleAnnotationClick(annotation.id)}
                  onDragEnd={(e) => handleAnnotationDragEnd(annotation.id, e)}
                  onTransformEnd={(e) => handleAnnotationTransform(annotation.id, e)}
                  stageSize={stageSize}
                />
              )
            }

            // For other annotation types
            const x = (annotation.position?.x / 100) * stageSize.width
            const y = (annotation.position?.y / 100) * stageSize.height

            // Common props for all annotation types
            const commonProps = {
              id: `annotation-${annotation.id}`,
              key: annotation.id,
              draggable: true,
              onClick: () => handleAnnotationClick(annotation.id),
              onTap: () => handleAnnotationClick(annotation.id),
              onDragEnd: (e) => handleAnnotationDragEnd(annotation.id, e),
              onTransformEnd: (e) => handleAnnotationTransform(annotation.id, e),
              stroke: annotation.style?.stroke || "#FFFFFF",
              strokeWidth: annotation.style?.strokeWidth || 2,
              fill: annotation.style?.fill,
            }

            switch (annotation.type) {
              case "rectangle":
                return (
                  <Rect
                    {...commonProps}
                    x={x}
                    y={y}
                    width={annotation.width || 100}
                    height={annotation.height || 50}
                    // Ensure the rectangle maintains its dimensions during transform
                    onTransform={(e) => {
                      const node = e.target
                      const scaleX = node.scaleX()
                      const scaleY = node.scaleY()

                      // Update width and height based on scale
                      const newWidth = (annotation.width || 100) * scaleX
                      const newHeight = (annotation.height || 50) * scaleY

                      // Apply reasonable limits to prevent excessive expansion
                      const maxWidth = stageSize.width * 0.9
                      const maxHeight = stageSize.height * 0.9

                      // Reset scale to prevent continuous expansion
                      node.scaleX(1)
                      node.scaleY(1)

                      // Update the annotation with new dimensions
                      onUpdateAnnotation(annotation.id, {
                        ...annotation,
                        width: Math.min(newWidth, maxWidth),
                        height: Math.min(newHeight, maxHeight),
                      })
                    }}
                  />
                )
              case "ellipse":
                return <Circle {...commonProps} x={x} y={y} radius={annotation.radius || 50} />
              case "line":
              case "freehand":
                return (
                  <Line
                    {...commonProps}
                    x={0}
                    y={0}
                    points={
                      annotation.points
                        ? annotation.points.map((point, index) => {
                            // Convert points to percentages of stage size
                            // Even indices are X coordinates, odd indices are Y coordinates
                            const value = point
                            const isX = index % 2 === 0

                            // Scale the point based on the current stage dimensions
                            return isX ? (value / 100) * stageSize.width + x : (value / 100) * stageSize.height + y
                          })
                        : [0, 0, 100, 100]
                    }
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                )
              case "arrow":
                return (
                  <Arrow
                    {...commonProps}
                    x={x}
                    y={y}
                    points={annotation.points || [0, 0, 100, 100]}
                    pointerLength={10}
                    pointerWidth={10}
                  />
                )
              default:
                return null
            }
          })}

          {/* Transformer for selected annotation */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit minimum size
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox
              }

              // Limit maximum size to prevent excessive expansion
              if (newBox.width > stageSize.width * 0.9 || newBox.height > stageSize.height * 0.9) {
                return oldBox
              }

              return newBox
            }}
            // Enable all anchors for all annotation types
            enabledAnchors={[
              "top-left",
              "top-center",
              "top-right",
              "middle-left",
              "middle-right",
              "bottom-left",
              "bottom-center",
              "bottom-right",
            ]}
            // Add rotator for all annotation types
            rotateEnabled={true}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          />
        </Layer>
      </Stage>
    )
  }

  return (
    <div
      className="flex-1 overflow-hidden bg-[#1A1A1A]"
      onMouseMove={(e) => {
        if (showCropSelector) handleCropMouseMove(e)
      }}
      onMouseUp={(e) => {
        if (showCropSelector) handleCropMouseUp()
      }}
    >
      <div className="h-full w-full flex items-center justify-center p-4">
        <div
          ref={mediaContainerRef}
          className="relative"
          style={{
            transform: `scale(${zoom / 100})`,
            transition: "transform 0.2s",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          onMouseDown={activeTool === "crop" && showCropSelector ? handleCropMouseDown : undefined}
        >
          {/* Crop selector overlay */}
          {activeTool === "crop" && showCropSelector && (
            <div
              style={{
                position: "absolute",
                left: `${localCropRegion.x}%`,
                top: `${localCropRegion.y}%`,
                width: `${localCropRegion.width}%`,
                height: `${localCropRegion.height}%`,
                border: "2px dashed #3b82f6",
                background: "rgba(59, 130, 246, 0.1)",
                zIndex: 50,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Media Element */}
          {mediaType === "video" ? (
            <video ref={mediaRef} src={mediaUrl} className="max-h-full max-w-full  object-contain" loop />
          ) : (
            <img
              ref={mediaRef}
              src={mediaUrl || "/placeholder.svg"}
              className="max-h-full max-w-full object-contain"
              alt="Media to edit"
            />
          )}

          {/* Konva Stage for stickers and annotations */}
          {renderKonvaElements()}

          {/* Inline Text Editor */}
          {showTextEditor && editingTextAnnotation && (
            <InlineTextEditor
              annotation={editingTextAnnotation}
              position={editingTextAnnotation.position}
              onUpdate={onUpdateAnnotation}
              onClose={() => {
                setShowTextEditor(false)
                setEditingTextAnnotation(null)
              }}
              stageSize={stageSize}
            />
          )}

          {/* Legacy canvas for compatibility */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              display: "none", // Hide the legacy canvas
              zIndex: 15,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MediaPreview
