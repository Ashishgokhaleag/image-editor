import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Download, Undo, Redo } from "lucide-react"
import { Button } from "../../ui/Buttons"
import EditorToolbar from "./EditorToolbar"
import EditorControls from "./EditorControls"
import VideoControls from "./controls/VideoControls"
import CropControls from "./controls/CropControls"
import FilterControls from "./controls/FilterControls"
import ResizeControls from "./controls/ResizeControls"
import AnnotateControls from "./controls/AnnotateControls"
import StickerControls from "./controls/StickerControls"
import { applyTransformation, getFilterStyle } from "../../../lib/editorUtils"
import MediaPreview from "./controls/MediaPreview"
import FinetuneControls from "./controls/FinetuneControls"
import TrimVideo from "./controls/TrimControls"

let ffmpeg = null
let isFFmpegLoaded = false

const Editor = ({ mediaUrl, mediaType, mediaName, onBack }) => {
  const [activeTool, setActiveTool] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [showTimeline, setShowTimeline] = useState(mediaType === "video")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [mediaHistory, setMediaHistory] = useState([{}])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [stickers, setStickers] = useState([])
  const [annotations, setAnnotations] = useState([])
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState(null)
  const [cropping, setCropping] = useState(false)
  const [showCropSelector, setShowCropSelector] = useState(false)

  const [cropOptions, setCropOptions] = useState({
    aspectRatio: null,
    rotation: 0,
    flip: { horizontal: false, vertical: false },
  })
  const [cropRegion, setCropRegion] = useState({
    x: 20,
    y: 20,
    width: 60,
    height: 60,
  })

  const [croppedVideoUrl, setCroppedVideoUrl] = useState(null)

  const [filterOptions, setFilterOptions] = useState({
    name: null,
    intensity: 100,
  })

  const [resizeOptions, setResizeOptions] = useState({
    width: 0,
    height: 0,
    maintainAspectRatio: true,
  })

  // Track the actual dimensions of the media element
  const [mediaDimensions, setMediaDimensions] = useState({
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  })

  const [finetuneOptions, setFinetuneOptions] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    exposure: 100,
  })

  // Add a state for finetune adjustments that will persist across tab changes
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    temperature: 0,
    gamma: 0,
    clarity: 0,
    vignette: 0,
  })

  const [selectedAnnotation, setSelectedAnnotation] = useState(null)
  const [editingAnnotationId, setEditingAnnotationId] = useState(null)

  const mediaRef = useRef(null)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const progressRef = useRef(null)
  const mediaContainerRef = useRef(null)
  const stageRef = useRef(null)

  // FFmpeg loader (persistent)
  const loadFFmpeg = async () => {
    if (!ffmpeg) {
      if (!window.FFmpeg) {
        await new Promise((resolve) => {
          const script = document.createElement("script")
          script.src = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js"
          script.onload = resolve
          document.head.appendChild(script)
        })
      }
      ffmpeg = window.FFmpeg.createFFmpeg({ log: true })
      await ffmpeg.load()
      isFFmpegLoaded = true
    }
    return ffmpeg
  }

  const handleToolChange = (tool) => {
    if (activeTool === tool) {
      setActiveTool(null)
    } else {
      setActiveTool(tool)

      // When switching to crop or sticker, ensure we have the latest media dimensions
      if (tool === "crop" || tool === "sticker") {
        updateMediaDimensions()
      }
    }
  }

  // Function to update media dimensions
  const updateMediaDimensions = () => {
    if (mediaRef.current) {
      const element = mediaRef.current
      const rect = element.getBoundingClientRect()

      setMediaDimensions({
        width: rect.width,
        height: rect.height,
        naturalWidth: mediaType === "video" ? element.videoWidth : element.naturalWidth,
        naturalHeight: mediaType === "video" ? element.videoHeight : element.naturalHeight,
      })
    }
  }

  const handleExport = () => {
    // Export functionality
  }

  const togglePlay = () => {
    if (mediaType === "video" && mediaRef.current) {
      const videoElement = mediaRef.current
      if (isPlaying) {
        videoElement.pause()
      } else {
        videoElement.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (mediaType === "video" && mediaRef.current) {
      const videoElement = mediaRef.current
      videoElement.muted = !videoElement.muted
      setIsMuted(!isMuted)
    }
  }

  const handleZoomChange = (value) => {
    setZoom(value)
    // Update dimensions after zoom changes
    setTimeout(updateMediaDimensions, 100)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      applyHistoryState(newIndex)
    }
  }

  const handleRedo = () => {
    if (historyIndex < mediaHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      applyHistoryState(newIndex)
    }
  }

  const applyHistoryState = (index) => {
    if (mediaRef.current && mediaHistory[index]) {
      const state = mediaHistory[index]
      applyTransformation(mediaRef.current, state)

      // Update dimensions after applying history state
      setTimeout(updateMediaDimensions, 100)
    }
  }

  const addToHistory = (changes) => {
    const newHistory = mediaHistory.slice(0, historyIndex + 1)
    const currentState = newHistory[newHistory.length - 1]
    const newState = { ...currentState, ...changes }
    setMediaHistory([...newHistory, newState])
    setHistoryIndex(newHistory.length)
    if (mediaRef.current) {
      applyTransformation(mediaRef.current, newState)

      // Update dimensions after applying transformation
      setTimeout(updateMediaDimensions, 100)
    }
  }

  const handleCropChange = (options) => {
    setCropOptions(options)
  }

  const handleCropRegionChange = (region) => {
    setCropRegion(region)
  }

  // Pass a handler to CropControls to show the crop selector
  const handleShowCropSelector = () => {
    updateMediaDimensions()
    setShowCropSelector(true)
  }

  // Crop video using ffmpeg.js
  const handleApplyCropRegion = async () => {
    if (mediaType !== "video" || !mediaRef.current) return
    setCropping(true)
    try {
      const ffmpegInstance = await loadFFmpeg()
      if (!isFFmpegLoaded) {
        alert("FFmpeg is still loading, please wait.")
        setCropping(false)
        return
      }

      // Get video dimensions
      const video = mediaRef.current
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      // Ensure crop region is within video bounds
      const safeRegion = {
        x: Math.max(0, Math.min(100, cropRegion.x)),
        y: Math.max(0, Math.min(100, cropRegion.y)),
        width: Math.max(10, Math.min(100 - cropRegion.x, cropRegion.width)),
        height: Math.max(10, Math.min(100 - cropRegion.y, cropRegion.height)),
      }

      // Convert cropRegion (percent) to pixels
      const x = Math.round((safeRegion.x / 100) * videoWidth)
      const y = Math.round((safeRegion.y / 100) * videoHeight)
      const width = Math.round((safeRegion.width / 100) * videoWidth)
      const height = Math.round((safeRegion.height / 100) * videoHeight)

      // Download video data
      const response = await fetch(trimmedVideoUrl || mediaUrl)
      const videoData = await response.arrayBuffer()
      const videoFileName = "input.mp4"

      // Remove previous files if they exist
      try {
        ffmpegInstance.FS("unlink", videoFileName)
      } catch {}
      try {
        ffmpegInstance.FS("unlink", "cropped.mp4")
      } catch {}

      ffmpegInstance.FS("writeFile", videoFileName, new Uint8Array(videoData))

      // Crop using ffmpeg (use libx264/aac for compatibility)
      const cropFilter = `crop=${width}:${height}:${x}:${y}`
      await ffmpegInstance.run("-i", videoFileName, "-vf", cropFilter, "-c:v", "libx264", "-c:a", "aac", "cropped.mp4")

      const data = ffmpegInstance.FS("readFile", "cropped.mp4")
      const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }))
      setCroppedVideoUrl(url)
      setShowCropSelector(false)

      // Update dimensions after cropping
      setTimeout(updateMediaDimensions, 100)
    } catch (err) {
      alert("Cropping failed: " + err.message)
    }
    setCropping(false)
  }

  const applyCrop = () => {
    addToHistory({ crop: cropOptions })

    // Update dimensions after applying crop
    setTimeout(updateMediaDimensions, 100)
  }

  const handleFilterChange = (options) => {
    setFilterOptions(options)
    if (mediaRef.current) {
      // Apply the filter directly to the media element
      let filterStyle = ""
      if (options.name) {
        filterStyle = getFilterStyle(options.name)
        // Apply intensity if needed
        if (options.intensity !== 100) {
          // For now, we'll just use the filter as is
          // In a more advanced implementation, you might want to adjust the intensity
        }
      }

      // Preserve any existing finetune adjustments
      let adjustmentString = ""
      if (adjustments.brightness !== 0) {
        adjustmentString += `brightness(${1 + adjustments.brightness / 100}) `
      }
      if (adjustments.contrast !== 0) {
        adjustmentString += `contrast(${1 + adjustments.contrast / 100}) `
      }
      if (adjustments.saturation !== 0) {
        adjustmentString += `saturate(${1 + adjustments.saturation / 100}) `
      }
      if (adjustments.exposure !== 0) {
        adjustmentString += `brightness(${1 + adjustments.exposure / 100}) `
      }
      if (adjustments.gamma !== 0) {
        adjustmentString += `contrast(${1 + adjustments.gamma / 200}) saturate(${1 + adjustments.gamma / 200}) `
      }
      if (adjustments.clarity !== 0) {
        adjustmentString += `contrast(${1 + adjustments.clarity / 200}) saturate(${1 + adjustments.clarity / 100}) `
      }
      if (adjustments.vignette !== 0) {
        adjustmentString += `brightness(${1 - Math.abs(adjustments.vignette) / 200}) `
      }

      // Combine filter and adjustments
      const combinedFilter = filterStyle ? filterStyle + " " + adjustmentString : adjustmentString
      mediaRef.current.style.filter = combinedFilter.trim() || "none"

      // Also update the history state
      applyTransformation(mediaRef.current, {
        ...mediaHistory[historyIndex],
        filter: options,
      })
    }
  }

  const applyFilter = () => {
    addToHistory({ filter: filterOptions })
  }

  const handleResizeChange = (options) => {
    setResizeOptions(options)
  }

  const applyResize = (options) => {
    const element = mediaRef.current
    const resize = options || resizeOptions

    // Check if we have valid dimensions
    if (element && resize?.width && resize?.height) {
      // Set the dimensions on the canvas element
      element.style.width = `${resize.width}px`
      element.style.height = `${resize.height}px`

      // Handle zoom behavior for larger dimensions
      const containerElement = containerRef.current
      if (containerElement) {
        const containerRect = containerElement.getBoundingClientRect()

        // Check if dimensions exceed container
        if (resize.width > containerRect.width || resize.height > containerRect.height) {
          // Ensure content fits using contain
          element.style.maxWidth = "100%"
          element.style.maxHeight = "100%"
          element.style.objectFit = "contain"
        } else {
          // Reset constraints when smaller than container
          element.style.maxWidth = "none"
          element.style.maxHeight = "none"
          element.style.objectFit = "none"
        }
      }

      // Apply the same dimensions to the video/image element
      if (mediaRef.current) {
        mediaRef.current.style.width = `${resize.width}px`
        mediaRef.current.style.height = `${resize.height}px`

        // Force a DOM reflow to ensure changes apply immediately
        void mediaRef.current.offsetHeight
      }
    }

    // Add to history to make the change permanent
    addToHistory({ resize })

    // Update dimensions after resize
    setTimeout(updateMediaDimensions, 100)
  }

  // Updated to use the adjustments state
  const handleFinetuneChange = (newAdjustments) => {
    setAdjustments(newAdjustments)
  }

  // Reset finetune adjustments
  const resetFinetuneAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      temperature: 0,
      gamma: 0,
      clarity: 0,
      vignette: 0,
    })

    if (mediaRef.current) {
      mediaRef.current.style.filter = "none"
    }
  }

  const applyFinetune = () => {
    addToHistory({ finetune: adjustments })
  }

  const handleAddSticker = (sticker) => {
    // Make sure we have the latest media dimensions
    updateMediaDimensions()

    const defaultPosition = { x: 50, y: 50 }
    setStickers((prevStickers) => [
      ...prevStickers,
      {
        ...sticker,
        id: Date.now(), // Ensure each sticker has a unique ID
        position: defaultPosition,
      },
    ])
  }

  const handleStickerChange = (id, newProperties) => {
    setStickers((prevStickers) =>
      prevStickers.map((sticker) => (sticker.id === id ? { ...sticker, ...newProperties } : sticker)),
    )
  }

  // Enhanced annotation functions
  const handleAddAnnotation = (annotation) => {
    // Generate a unique ID if not provided
    const id = annotation.id || Date.now()

    // Default position to center if not provided
    const position = annotation.position || { x: 50, y: 50 }

    setAnnotations((prev) => [
      ...prev,
      {
        ...annotation,
        id,
        position,
        // Include default style information for text annotations
        style:
          annotation.type === "text"
            ? {
                fontSize: annotation.style?.fontSize || 24,
                fontFamily: annotation.style?.fontFamily || "sans-serif",
                bold: annotation.style?.bold || false,
                italic: annotation.style?.italic || false,
                underline: annotation.style?.underline || false,
                color: annotation.style?.color || "#FFFFFF",
                backgroundColor: annotation.style?.backgroundColor || "rgba(0, 0, 0, 0.5)",
                textAlign: annotation.style?.textAlign || "left",
              }
            : {
                strokeWidth: annotation.style?.strokeWidth || 2,
                stroke: annotation.style?.stroke || "#FFFFFF",
                fill:
                  annotation.style?.fill ||
                  (annotation.type === "arrow" || annotation.type === "line" ? undefined : "rgba(255, 255, 255, 0.2)"),
              },
      },
    ])
  }

  // Update the handleUpdateAnnotation function to ensure it properly handles text content updates
  const handleUpdateAnnotation = (id, newProperties) => {
    setAnnotations((prev) => {
      // Check if annotation exists
      const exists = prev.some((a) => a.id === id)

      if (exists) {
        // Update existing annotation
        return prev.map((annotation) => {
          if (annotation.id === id) {
            // For rectangles, ensure width and height are reasonable
            const updatedProps = { ...newProperties }

            if (annotation.type === "rectangle" || newProperties.type === "rectangle") {
              // Limit maximum width and height to prevent full-screen expansion
              if (updatedProps.width && updatedProps.width > mediaDimensions.width) {
                updatedProps.width = mediaDimensions.width * 0.8
              }

              if (updatedProps.height && updatedProps.height > mediaDimensions.height) {
                updatedProps.height = mediaDimensions.height * 0.8
              }
            }

            // For text annotations, ensure content is properly handled
            if (annotation.type === "text") {
              // If we're updating style but not content, keep the existing content
              if (updatedProps.style && updatedProps.content === undefined) {
                updatedProps.content = annotation.content
              }

              // Allow empty or modified content (including shorter than original)
              if (updatedProps.content !== undefined) {
                // Keep the content as provided, even if empty or shorter
              }
            }

            return { ...annotation, ...updatedProps }
          }
          return annotation
        })
      } else {
        // Add as new annotation if it doesn't exist
        const newAnnotation = { id, ...newProperties }
        return [...prev, newAnnotation]
      }
    })

    // Force a re-render of the canvas
    setTimeout(() => {
      if (stageRef.current) {
        stageRef.current.batchDraw()
      }
    }, 50)
  }

  // New function to delete annotation
  const handleDeleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id))
  }

  // Add this function to handle annotation selection
  const handleAnnotationSelection = (id) => {
    setSelectedAnnotation(id)

    // If it's a text annotation, open the editor
    const annotation = annotations.find((a) => a.id === id)
    if (annotation && annotation.type === "text") {
      setEditingAnnotationId(id)
    }
  }

  const updateProgress = () => {
    if (mediaType === "video" && mediaRef.current && progressRef?.current) {
      const videoElement = mediaRef.current
      const progress = (videoElement.currentTime / videoElement.duration) * 100
      progressRef.current.style.width = `${progress}%`
      setCurrentTime(videoElement.currentTime)
    }
  }

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleUpdateSticker = (stickerIndex, updatedSticker) => {
    setStickers((prevStickers) => {
      const newStickers = [...prevStickers]
      newStickers[stickerIndex] = updatedSticker
      return newStickers
    })
  }

  const handleDeleteSticker = (index) => {
    setStickers((prevStickers) => {
      const newStickers = [...prevStickers]
      newStickers.splice(index, 1)
      return newStickers
    })
  }

  const handleTrimComplete = (trimmedUrl) => {
    setTrimmedVideoUrl(trimmedUrl)
    console.log("Trimmed video URL:", trimmedUrl)

    // Update dimensions after trimming
    setTimeout(updateMediaDimensions, 100)
  }

  useEffect(() => {
    if (mediaType === "video" && mediaRef.current) {
      const videoElement = mediaRef.current

      const handlePlayEvent = () => setIsPlaying(true)
      const handlePauseEvent = () => setIsPlaying(false)
      const handleEndEvent = () => setIsPlaying(false)
      const handleTimeUpdate = () => updateProgress()
      const handleDurationChange = () => setDuration(videoElement.duration)

      videoElement.addEventListener("play", handlePlayEvent)
      videoElement.addEventListener("pause", handlePauseEvent)
      videoElement.addEventListener("ended", handleEndEvent)
      videoElement.addEventListener("timeupdate", handleTimeUpdate)
      videoElement.addEventListener("durationchange", handleDurationChange)

      return () => {
        videoElement.removeEventListener("play", handlePlayEvent)
        videoElement.removeEventListener("pause", handlePauseEvent)
        videoElement.removeEventListener("ended", handleEndEvent)
        videoElement.removeEventListener("timeupdate", handleTimeUpdate)
        videoElement.removeEventListener("durationchange", handleDurationChange)
      }
    }
  }, [mediaType])

  useEffect(() => {
    const handleMediaLoad = () => {
      if (mediaRef.current) {
        const element = mediaRef.current
        const naturalWidth = mediaType === "video" ? element.videoWidth : element.naturalWidth
        const naturalHeight = mediaType === "video" ? element.videoHeight : element.naturalHeight

        if (naturalWidth && naturalHeight) {
          setResizeOptions({
            width: naturalWidth,
            height: naturalHeight,
            maintainAspectRatio: true,
          })

          // Update media dimensions
          setMediaDimensions({
            width: naturalWidth,
            height: naturalHeight,
            naturalWidth: naturalWidth,
            naturalHeight: naturalHeight,
          })
        }
      }
    }

    if (mediaRef.current) {
      if (mediaType === "video") {
        mediaRef.current.addEventListener("loadedmetadata", handleMediaLoad)
      } else {
        mediaRef.current.addEventListener("load", handleMediaLoad)
      }
    }

    return () => {
      if (mediaRef.current) {
        if (mediaType === "video") {
          mediaRef.current.removeEventListener("loadedmetadata", handleMediaLoad)
        } else {
          mediaRef.current.removeEventListener("load", handleMediaLoad)
        }
      }
    }
  }, [mediaType])

  // Make sure to clear any filters when changing tools or on component unmount
  useEffect(() => {
    // We'll apply the finetune adjustments whenever the tool changes
    if (mediaRef.current) {
      if (activeTool !== "finetune") {
        // When not in finetune mode, still apply the saved adjustments
        let filterString = ""

        // Apply filter if one is selected
        if (filterOptions.name) {
          const filterStyle = getFilterStyle(filterOptions.name)
          // Apply filter with intensity
          if (filterStyle) {
            filterString += filterStyle + " "
          }
        }

        if (adjustments.brightness !== 0) {
          filterString += `brightness(${1 + adjustments.brightness / 100}) `
        }
        if (adjustments.contrast !== 0) {
          filterString += `contrast(${1 + adjustments.contrast / 100}) `
        }
        if (adjustments.saturation !== 0) {
          filterString += `saturate(${1 + adjustments.saturation / 100}) `
        }
        if (adjustments.exposure !== 0) {
          filterString += `brightness(${1 + adjustments.exposure / 100}) `
        }
        if (adjustments.gamma !== 0) {
          filterString += `contrast(${1 + adjustments.gamma / 200}) saturate(${1 + adjustments.gamma / 200}) `
        }
        if (adjustments.clarity !== 0) {
          filterString += `contrast(${1 + adjustments.clarity / 200}) saturate(${1 + adjustments.clarity / 100}) `
        }
        if (adjustments.vignette !== 0) {
          filterString += `brightness(${1 - Math.abs(adjustments.vignette) / 200}) `
        }

        mediaRef.current.style.filter = filterString.trim() || "none"
      }
    }

    // Update dimensions when tool changes
    if (activeTool === "crop" || activeTool === "sticker") {
      updateMediaDimensions()
    }
  }, [activeTool, adjustments, filterOptions])

  // Add a resize observer to update dimensions when the window or container size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateMediaDimensions()
    })

    if (mediaContainerRef.current) {
      resizeObserver.observe(mediaContainerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [textAlign, setTextAlign] = useState("left")
  const [color, setColor] = useState("#FFFFFF")
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  })

  // Update the createAnnotation function to handle text properly
  const createAnnotation = (toolType) => {
    if (!handleAddAnnotation) return

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
      // Other cases remain the same...
    }

    // Add the annotation
    const createdAnnotation = { ...newAnnotation, id: Date.now() }
    handleAddAnnotation(createdAnnotation)

    // Select the new annotation
    setSelectedAnnotation(createdAnnotation.id)

    // If it's a text annotation, show the editor immediately
    if (tool === "text") {
      setEditingAnnotationId(createdAnnotation.id)
    }
  }

  const renderActiveToolControls = () => {
    console.log("activeTool????", activeTool)
    switch (activeTool) {
      case "trim":
        return (
          <TrimVideo mediaRef={mediaRef} mediaUrl={trimmedVideoUrl || mediaUrl} onTrimComplete={handleTrimComplete} />
        )
      case "crop":
        return (
          <CropControls
            mediaRef={mediaRef}
            mediaType={mediaType}
            cropOptions={cropOptions}
            onCropChange={handleCropChange}
            onApplyCrop={applyCrop}
            onApplyCropRegion={handleApplyCropRegion}
            onShowCropSelector={handleShowCropSelector}
            showCropSelector={showCropSelector}
            onSetCropRegion={setCropRegion}
            mediaDimensions={mediaDimensions}
          />
        )
      case "finetune":
        return (
          <FinetuneControls
            mediaRef={mediaRef}
            mediaType={mediaType}
            adjustments={adjustments}
            onAdjustmentChange={handleFinetuneChange}
            onResetAdjustments={resetFinetuneAdjustments}
            onApplyFinetune={applyFinetune}
          />
        )
      case "filter":
        return (
          <FilterControls
            mediaRef={mediaRef}
            mediaType={mediaType}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onApplyFilter={applyFilter}
          />
        )
      case "annotate":
        return (
          <AnnotateControls
            mediaRef={mediaRef}
            mediaType={mediaType}
            canvasRef={canvasRef}
            onAddAnnotation={handleAddAnnotation}
            onUpdateAnnotation={handleUpdateAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            annotations={annotations}
            selectedAnnotation={selectedAnnotation}
            setSelectedAnnotation={setSelectedAnnotation}
            editingAnnotationId={editingAnnotationId}
            setEditingAnnotationId={setEditingAnnotationId}
            mediaDimensions={mediaDimensions}
            stageRef={stageRef}
            createAnnotation={createAnnotation}
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
            color={color}
            setColor={setColor}
            textFormatting={textFormatting}
            setTextFormatting={setTextFormatting}
          />
        )
      case "sticker":
        return (
          <StickerControls
            mediaRef={mediaRef}
            mediaType={mediaType}
            zoom={zoom}
            onZoomChange={handleZoomChange}
            onAddSticker={handleAddSticker}
            mediaDimensions={mediaDimensions}
          />
        )
      case "resize":
        return (
          <ResizeControls
            mediaRef={mediaRef}
            mediaType={mediaType}
            resizeOptions={resizeOptions}
            onResizeChange={handleResizeChange}
            onApplyResize={applyResize}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-5rem)]">
      <div className="border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        <Button size="sm" variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Undo</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={handleRedo}
            disabled={historyIndex >= mediaHistory.length - 1}
          >
            <Redo className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Redo</span>
          </Button>

          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <EditorToolbar activeTool={activeTool} onToolChange={handleToolChange} mediaType={mediaType} />

        <div className="flex-1 overflow-hidden flex flex-col" ref={mediaContainerRef}>
          {/* Show loading overlay if cropping */}
          {cropping && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="text-white text-lg font-semibold">Cropping video, please wait...</div>
            </div>
          )}

          <MediaPreview
            mediaRef={mediaRef}
            canvasRef={canvasRef}
            mediaType={mediaType}
            mediaUrl={croppedVideoUrl || trimmedVideoUrl || mediaUrl}
            stickers={stickers}
            annotations={annotations}
            zoom={zoom}
            onUpdateSticker={handleUpdateSticker}
            onDeleteSticker={handleDeleteSticker}
            onUpdateAnnotation={handleUpdateAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            activeTool={activeTool}
            cropRegion={cropRegion}
            onCropRegionChange={handleCropRegionChange}
            showCropSelector={showCropSelector}
            selectedAnnotation={selectedAnnotation}
            setSelectedAnnotation={setSelectedAnnotation}
            editingAnnotationId={editingAnnotationId}
            setEditingAnnotationId={setEditingAnnotationId}
            containerRef={containerRef}
            mediaDimensions={mediaDimensions}
            updateMediaDimensions={updateMediaDimensions}
            stageRef={stageRef}
          />

          {mediaType === "video" && (
            <VideoControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              currentTime={currentTime}
              duration={duration}
              showTimeline={showTimeline}
              onTogglePlay={togglePlay}
              onToggleMute={toggleMute}
              formatTime={formatTime}
            />
          )}
        </div>

        <EditorControls
          activeTool={activeTool}
          onClose={() => setActiveTool(null)}
          zoom={zoom}
          onZoomChange={handleZoomChange}
        >
          {renderActiveToolControls()}
        </EditorControls>
      </div>
    </div>
  )
}

export default Editor
