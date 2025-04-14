import { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  RotateCw,
  Plus,
  Minus,
  Check,
  Play,
  Volume2,
  VolumeX,
  Split,
  FlipHorizontal,
  SquareAsterisk,
} from "lucide-react";
import EditorToolbar from "./EditorToolbar";
import FilterGallery from "./FilterGallery";
import EmojiSelector from "./EmojiSelector";
import DrawingTools from "./DrawingTools";
import { Button } from "../ui/Buttons";
import AdjustmentSlider from "./AdjustmentSlider";
import UploadCard from "./UploadCard";
import Editor from "./components/Editor";

const VideoScreen = ({ isDarkMode, handleUpload, media, handleReset }) => {
  const [mode, setMode] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [filter, setFilter] = useState("default");
  const [currentAdjustment, setCurrentAdjustment] = useState("brightness");
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    temperature: 0,
    gamma: 0,
    clarity: 0,
    vignette: 0,
  });
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
  const [rotation, setRotation] = useState(0);
  const [currentTool, setCurrentTool] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("Editor initialized");
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determine if it's an image or video
    const fileType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : null;

    if (!fileType) {
      return;
    }

    // Create a URL for the file
    const url = URL.createObjectURL(file);
    // setMedia({ type: fileType, src: url });
    setMode(null);
  };

  const triggerFileUpload = (mediaType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        mediaType === "image" ? "image/*" : "video/*";
      fileInputRef.current.click();
    }
  };

  const handleToolSelect = (tool) => {
    switch (tool) {
      case "trim":
        setMode("video");
        break;
      case "crop":
        setMode("crop");
        break;
      case "finetune":
        setMode("adjust");
        setCurrentAdjustment("brightness");
        break;
      case "filter":
        setMode("filter");
        break;
      case "annotate":
        setMode("draw");
        setCurrentTool("sharpie");
        break;
      case "sticker":
        setMode("emoji");
        break;
      case "resize":
        setMode("resize");
        break;
      case "upload":
        setMode("upload");
        break;
      default:
        setMode(null);
    }
  };

  const handleModeClose = () => {
    setMode(null);
  };

  const handleSave = () => {
    setMode(null);
  };

  const handleFilterSelect = (filterName) => {
    setFilter(filterName);
  };

  const handleAdjustmentChange = (value) => {
    setAdjustments((prev) => ({
      ...prev,
      [currentAdjustment]: value,
    }));
  };

  const handleAdjustmentTypeChange = (type) => {
    setCurrentAdjustment(type);
  };

  const handleZoomChange = (delta) => {
    setZoom((prev) => Math.max(10, Math.min(100, prev + delta)));
  };

  const handleDimensionChange = (dim, value) => {
    setDimensions((prev) => ({
      ...prev,
      [dim]: value,
    }));
  };

  const handleRotationChange = (deg) => {
    setRotation((prev) => prev + deg);
  };

  const handleDrawingToolSelect = (tool) => {
    setCurrentTool(tool);
  };

  const handleVideoAction = (action) => {
    switch (action) {
      case "play":
        setIsPlaying(!isPlaying);
        break;
      case "mute":
        setIsMuted(!isMuted);
        break;
      case "split":
        break;
    }
  };

  console.log("mode>>>>>", mode);

  return (
    <div
      className={`flex flex-col h-full ${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,video/*"
      />

      <div className="flex items-center justify-between p-2 border-b border-gray-800 mt-6">
        <button
          className={`rounded-full ${
            isDarkMode ? "bg-gray-800" : "bg-gray-200"
          } p-2`}
        >
          <RotateCcw size={18} />
        </button>

        <div className="flex space-x-1">
          {mode === "crop" && (
            <>
              <button
                className={`rounded ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } px-2 py-1 text-xs`}
              >
                <RotateCw size={16} className="inline mr-1" />
              </button>
              <button
                className={`rounded ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } px-2 py-1 text-xs`}
              >
                <FlipHorizontal size={16} className="inline mr-1" />
              </button>
              <button
                className={`rounded ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } px-2 py-1 text-xs`}
              >
                <SquareAsterisk size={16} className="inline mr-1" />
              </button>
            </>
          )}

          {mode === "rotate" && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleRotationChange(-90)}
                className={`rounded-full ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } p-1`}
              >
                <RotateCcw size={16} />
              </button>
              <span>{rotation}°</span>
              <button
                onClick={() => handleRotationChange(90)}
                className={`rounded-full ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } p-1`}
              >
                <RotateCw size={16} />
              </button>
            </div>
          )}

          {mode === null && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleZoomChange(-5)}
                className={`rounded-full ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } p-1`}
              >
                <Minus size={16} />
              </button>
              <span className="text-sm">{zoom}%</span>
              <button
                onClick={() => handleZoomChange(5)}
                className={`rounded-full ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } p-1`}
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          {mode === "resize" && (
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center rounded ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } px-2`}
              >
                <input
                  type="number"
                  className={`w-16 bg-transparent text-center ${
                    !isDarkMode && "text-black"
                  }`}
                  value={dimensions.width}
                  onChange={(e) =>
                    handleDimensionChange(
                      "width",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <span>W</span>
              </div>
              <span>×</span>
              <div
                className={`flex items-center rounded ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } px-2`}
              >
                <input
                  type="number"
                  className={`w-16 bg-transparent text-center ${
                    !isDarkMode && "text-black"
                  }`}
                  value={dimensions.height}
                  onChange={(e) =>
                    handleDimensionChange(
                      "height",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <span>H</span>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSave} className="rounded-full bg-yellow-400 p-2">
          <Check size={18} className="text-black" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video
          src={media.src}
          className="object-contain max-w-full max-h-full"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
          }}
          controls={false}
          muted={isMuted}
          loop
          playsInline
          autoPlay={isPlaying}
        />

        {mode === "crop" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-white resize aspect-square relative">
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white rounded-full"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        )}

        {mode === "draw" && currentTool && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full border-2 border-white w-6 h-6"></div>
          </div>
        )}

        {mode === "upload" && {
          ...(media.url ? (
            <Editor
              mediaUrl={media.url}
              mediaName={media.file?.name || "Untitled"}
              onBack={handleReset}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto">
              <UploadCard onUpload={handleUpload} />
            </div>
          )),
        }}
      </div>

      {mode === "filter" && (
        <FilterGallery
          onSelect={handleFilterSelect}
          current={filter}
          isDarkMode={isDarkMode}
        />
      )}

      {mode === "emoji" && (
        <EmojiSelector
          onSelect={(emoji) => console.log(`${emoji} selected`)}
          isDarkMode={isDarkMode}
        />
      )}

      {mode === "draw" && (
        <DrawingTools
          onSelect={handleDrawingToolSelect}
          current={currentTool}
          isDarkMode={isDarkMode}
        />
      )}

      {mode === "adjust" && (
        <div
          className={`p-4 ${
            isDarkMode
              ? "bg-black border-t border-gray-800"
              : "bg-white border-t border-gray-300"
          }`}
        >
          <AdjustmentSlider
            value={adjustments[currentAdjustment]}
            onChange={handleAdjustmentChange}
            isDarkMode={isDarkMode}
          />
          <div className="flex justify-between mt-4 overflow-x-auto space-x-2 pb-2">
            {[
              "brightness",
              "contrast",
              "saturation",
              "exposure",
              "temperature",
              "gamma",
              "clarity",
              "vignette",
            ].map((type) => (
              <Button
                key={type}
                onClick={() => handleAdjustmentTypeChange(type)}
                variant={currentAdjustment === type ? "secondary" : "ghost"}
                className="rounded-full text-xs py-1 px-3 capitalize whitespace-nowrap"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      )}

      {mode === "video" && (
        <div
          className={`p-4 ${
            isDarkMode
              ? "bg-black border-t border-gray-800"
              : "bg-white border-t border-gray-300"
          }`}
        >
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => handleVideoAction("play")}
              className={`rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              } p-2`}
            >
              {isPlaying ? <Play size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={() => handleVideoAction("mute")}
              className={`rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              } p-2`}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={() => handleVideoAction("split")}
              className={`rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              } p-2`}
            >
              <Split size={20} />
            </button>
          </div>

          <div className="flex items-center text-xs space-x-2">
            <span>0:00</span>
            <div
              className={`flex-1 relative h-1 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              }`}
            >
              <div
                className="absolute left-0 top-0 h-full bg-white"
                style={{ width: `${(videoProgress / 100) * 100}%` }}
              ></div>
              <div
                className="absolute w-3 h-3 bg-white rounded-full top-1/2 transform -translate-y-1/2"
                style={{ left: `${videoProgress}%` }}
              ></div>
            </div>
            <span>0:04</span>
          </div>

          <div className="mt-4 flex overflow-x-auto space-x-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-12 h-12 ${
                  isDarkMode ? "bg-gray-600" : "bg-gray-300"
                } ${i === 3 ? "border-2 border-white" : ""}`}
              ></div>
            ))}
          </div>
        </div>
      )}

      <EditorToolbar onToolSelect={handleToolSelect} isDarkMode={isDarkMode} />
    </div>
  );
};

export default VideoScreen;
