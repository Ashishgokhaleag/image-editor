import { useState, useRef, useEffect } from "react";
// import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Undo,
  Redo,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../ui/Buttons";
import EditorToolbar from "./EditorToolbar";
import EditorControls from "./EditorControls";
// import TrimControls from "./controls/TrimControls";
import CropControls from "./controls/CropControls";
import FilterControls from "./controls/FilterControls";
import ResizeControls from "./controls/ResizeControls";
// import AnnotateControls from "./controls/AnnotateControls";
// import StickerControls from "./controls/StickerControls";
// import FinetuneControls from "./controls/FinetuneControls";
import { 
  applyTransformation, 
} from "../../../lib/editorUtils";

const Editor = ({ mediaUrl, mediaType, mediaName, onBack }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showTimeline, setShowTimeline] = useState(mediaType === 'video');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mediaHistory, setMediaHistory] = useState([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  console.log("editor>>>>")
  
  const [cropOptions, setCropOptions] = useState({
    aspectRatio: null,
    rotation: 0,
    flip: { horizontal: false, vertical: false }
  });
  
  const [filterOptions, setFilterOptions] = useState({
    name: null,
    intensity: 100
  });
  
  const [resizeOptions, setResizeOptions] = useState({
    width: 0,
    height: 0,
    maintainAspectRatio: true
  });
  
  const [finetuneOptions, setFinetuneOptions] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    exposure: 100
  });
  
  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef>(null);
  
  const handleToolChange = (tool) => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
    }
  };

  const handleExport = () => {
    // toast.success("Media exported successfully", {
    //   description: "Your file has been saved",
    // });
  };

  const togglePlay = () => {
    if (mediaType === 'video' && mediaRef.current) {
      const videoElement = mediaRef.current;
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (mediaType === 'video' && mediaRef.current) {
      const videoElement = mediaRef.current;
      videoElement.muted = !videoElement.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleZoomChange = (value) => {
    setZoom(value);
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      applyHistoryState(newIndex);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < mediaHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      applyHistoryState(newIndex);
    }
  };
  
  const applyHistoryState = (index) => {
    if (mediaRef.current && mediaHistory[index]) {
      const state = mediaHistory[index];
      applyTransformation(mediaRef.current, state);
    }
  };
  
  const addToHistory = (changes) => {
    const newHistory = mediaHistory.slice(0, historyIndex + 1);
    
    const currentState = newHistory[newHistory.length - 1];
    const newState = { ...currentState, ...changes };
    
    setMediaHistory([...newHistory, newState]);
    setHistoryIndex(newHistory.length);
    
    if (mediaRef.current) {
      applyTransformation(mediaRef.current, newState);
    }
  };
  
  const handleCropChange = (options) => {
    setCropOptions(options);
  };
  
  const applyCrop = () => {
    addToHistory({ crop: cropOptions });
    // toast.success("Crop applied successfully");
  };
  
  const handleFilterChange = (options) => {
    setFilterOptions(options);
    
    if (mediaRef.current) {
      applyTransformation(mediaRef.current, { 
        ...mediaHistory[historyIndex],
        filter: options 
      });
    }
  };
  
  const applyFilter = () => {
    addToHistory({ filter: filterOptions });
    // toast.success("Filter applied successfully");
  };
  
  const handleResizeChange = (options) => {
    setResizeOptions(options);
  };
  
  const applyResize = () => {
    addToHistory({ resize: resizeOptions });
    // toast.success("Resize applied successfully");
  };
  
  const handleFinetuneChange = (options) => {
    setFinetuneOptions(options);
    
    if (mediaRef.current) {
      applyTransformation(mediaRef.current, { 
        ...mediaHistory[historyIndex],
        finetune: options 
      });
    }
  };
  
  const applyFinetune = () => {
    addToHistory({ finetune: finetuneOptions });
    // toast.success("Adjustments applied successfully");
  };
  
  const updateProgress = () => {
    if (mediaType === 'video' && mediaRef.current && progressRef?.current) {
      const videoElement = mediaRef.current;
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      progressRef.current.style.width = `${progress}%`;
      setCurrentTime(videoElement.currentTime);
    }
  };
  
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (mediaType === 'video' && mediaRef.current) {
      const videoElement = mediaRef.current;
      
      const handlePlayEvent = () => setIsPlaying(true);
      const handlePauseEvent = () => setIsPlaying(false);
      const handleEndEvent = () => setIsPlaying(false);
      const handleTimeUpdate = () => updateProgress();
      const handleDurationChange = () => setDuration(videoElement.duration);
      
      videoElement.addEventListener('play', handlePlayEvent);
      videoElement.addEventListener('pause', handlePauseEvent);
      videoElement.addEventListener('ended', handleEndEvent);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('durationchange', handleDurationChange);
      
      return () => {
        videoElement.removeEventListener('play', handlePlayEvent);
        videoElement.removeEventListener('pause', handlePauseEvent);
        videoElement.removeEventListener('ended', handleEndEvent);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('durationchange', handleDurationChange);
      };
    }
  }, [mediaType]);
  
  useEffect(() => {
    const handleMediaLoad = () => {
      if (mediaRef.current) {
        const element = mediaRef.current;
        setResizeOptions({
          width: element.clientWidth,
          height: element.clientHeight,
          maintainAspectRatio: true
        });
      }
    };
    
    if (mediaRef.current) {
      if (mediaType === 'video') {
        (mediaRef.current).addEventListener('loadedmetadata', handleMediaLoad);
      } else {
        (mediaRef.current).addEventListener('load', handleMediaLoad);
      }
    }
    
    return () => {
      if (mediaRef.current) {
        if (mediaType === 'video') {
          (mediaRef.current).removeEventListener('loadedmetadata', handleMediaLoad);
        } else {
          (mediaRef.current).removeEventListener('load', handleMediaLoad);
        }
      }
    };
  }, [mediaType]);

  const renderActiveToolControls = () => {
    switch (activeTool) {
      case "trim":
        return null
        //  <TrimControls 
        //         mediaRef={mediaRef} 
        //         mediaType={mediaType} 
        //        />;
      case "crop":
        return null
        // <CropControls 
        //         mediaRef={mediaRef} 
        //         mediaType={mediaType} 
        //         cropOptions={cropOptions}
        //         onCropChange={handleCropChange}
        //         onApplyCrop={applyCrop}
        //        />;
      case "finetune":
        return null
        // <FinetuneControls 
        //         mediaRef={mediaRef} 
        //         mediaType={mediaType} 
        //        />;
      case "filter":
        return <FilterControls 
                mediaRef={mediaRef} 
                mediaType={mediaType} 
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onApplyFilter={applyFilter}
               />;
      case "annotate":
        return null
        // <AnnotateControls 
        //         mediaRef={mediaRef} 
        //         mediaType={mediaType} 
        //        />;
      case "sticker":
        return null
        // <StickerControls 
        //         mediaRef={mediaRef} 
        //         mediaType={mediaType} 
        //        />;
      case "resize":
        return <ResizeControls 
                mediaRef={mediaRef} 
                mediaType={mediaType} 
                resizeOptions={resizeOptions}
                onResizeChange={handleResizeChange}
                onApplyResize={applyResize}
               />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-5rem)]">
      <div className="border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
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
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          mediaType={mediaType}
        />

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-[#1A1A1A]">
            <div 
              ref={containerRef}
              className="h-full w-full flex items-center justify-center p-4"
            >
              <div 
                className="relative"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transition: "transform 0.2s"
                }}
              >
                  <video
                    ref={mediaRef}
                    src={mediaUrl}
                    className="max-h-full max-w-full object-contain"
                    loop
                  />
              </div>
            </div>
          </div>

          {mediaType === "video" && (
            <div className="px-4 py-2 bg-editor-darker border-t border-gray-800">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                
                {/* <div className="flex-1 mx-2">
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div 
                      ref={progressRef}
                      className="h-full bg-primary rounded-full" 
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                </div> */}
                
                <span className="text-sm text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowTimeline(!showTimeline)}
                >
                  {showTimeline ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {/* {showTimeline && (
                <div className="mt-2 flex space-x-1 overflow-x-auto py-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="timeline-item">
                      <img 
                        src={mediaUrl} 
                        alt={`Frame ${i}`} 
                        className="w-full h-12 object-cover" 
                      />
                    </div>
                  ))}
                </div>
              )} */}
            </div>
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
  );
};

export default Editor;
