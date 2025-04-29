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
import { applyTransformation } from "../../../lib/editorUtils"
import MediaPreview from "./controls/MediaPreview"
import FinetuneControls from "./controls/FinetuneControls"
import TrimVideo from "./controls/TrimControls"

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

  const [cropOptions, setCropOptions] = useState({
    aspectRatio: null,
    rotation: 0,
    flip: { horizontal: false, vertical: false },
  })

  const [filterOptions, setFilterOptions] = useState({
    name: null,
    intensity: 100,
  })

  const [resizeOptions, setResizeOptions] = useState({
    width: 0,
    height: 0,
    maintainAspectRatio: true,
  })

  const [finetuneOptions, setFinetuneOptions] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    exposure: 100,
  })

  const mediaRef = useRef(null)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const progressRef = useRef(null)

  const handleToolChange = (tool) => {
    if (activeTool === tool) {
      setActiveTool(null)
    } else {
      setActiveTool(tool)
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
    }
  }

  const handleCropChange = (options) => {
    setCropOptions(options)
  }

  const applyCrop = () => {
    addToHistory({ crop: cropOptions })
  }

  const handleFilterChange = (options) => {
    setFilterOptions(options)
    if (mediaRef.current) {
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

  const applyResize = () => {
    addToHistory({ resize: resizeOptions })
  }

  const handleFinetuneChange = (options) => {
    setFinetuneOptions(options)
    if (mediaRef.current) {
      applyTransformation(mediaRef.current, {
        ...mediaHistory[historyIndex],
        finetune: options,
      })
    }
  }

  const applyFinetune = () => {
    addToHistory({ finetune: finetuneOptions })
  }

  const handleAddSticker = (sticker) => {
    const defaultPosition = { x: 50, y: 50 }
    setStickers((prevStickers) => [...prevStickers, { ...sticker, id: Date.now(), position: defaultPosition }])
  }

  const handleStickerChange = (id, newProperties) => {
    setStickers((prevStickers) =>
      prevStickers.map((sticker) => (sticker.id === id ? { ...sticker, ...newProperties } : sticker)),
    )
  }

  // New function to add annotation
  const handleAddAnnotation = (annotation) => {
    // Default position to center if not provided
    const position = annotation.position || { x: 50, y: 50 }

    setAnnotations((prev) => [
      ...prev,
      {
        ...annotation,
        id: Date.now(),
        position,
        // Include default style information for text annotations
        style:
          annotation.type === "text"
            ? {
                fontSize: 24,
                fontFamily: "sans-serif",
                bold: false,
                italic: false,
                underline: false,
                color: "#FFFFFF",
              }
            : undefined,
      },
    ])
  }

  // New function to update annotation
  const handleUpdateAnnotation = (id, newProperties) => {
    setAnnotations((prev) =>
      prev.map((annotation) => (annotation.id === id ? { ...annotation, ...newProperties } : annotation)),
    )
  }

  // New function to delete annotation
  const handleDeleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id))
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

  const handleUpdateSticker = (index, updatedSticker) => {
    setStickers((prevStickers) => {
      const newStickers = [...prevStickers]
      newStickers[index] = updatedSticker
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
        setResizeOptions({
          width: element.clientWidth,
          height: element.clientHeight,
          maintainAspectRatio: true,
        })
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

  const renderActiveToolControls = () => {
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
          />
        )
      case "finetune":
        return <FinetuneControls mediaRef={mediaRef} mediaType={mediaType} />
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

        <div className="flex-1 overflow-hidden flex flex-col">
          <MediaPreview
            mediaRef={mediaRef}
            canvasRef={canvasRef}
            mediaType={mediaType}
            mediaUrl={trimmedVideoUrl || mediaUrl}
            stickers={stickers}
            annotations={annotations}
            zoom={zoom}
            onUpdateSticker={handleUpdateSticker}
            onDeleteSticker={handleDeleteSticker}
            onUpdateAnnotation={handleUpdateAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            activeTool={activeTool}
          />
          {/* 
          {trimmedVideoUrl && (
            <div className="trimmed-video-preview">
              <h3>Trimmed Video Preview</h3>
              <video controls src={trimmedVideoUrl} />
            </div>
          )} */}

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
