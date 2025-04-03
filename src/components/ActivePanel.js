import React from "react";
import {
  annotationTools,
  colors,
  filters,
  frames,
  lineWidths,
  ShapesTools,
} from "../constant";
import { CopyPlus, CopyX, Crop, FlipHorizontal, RotateCcw } from "lucide-react";

const ActivePanel = ({
  expandedPanel,
  canvas,
  activeFilter,
  applyFilter,
  handleAdjustmentChange,
  handleRotateLeft,
  handleFlipHorizontal,
  setCropMode,
  cropMode,
  handleApplyCrop,
  applyMask,
  clearMasking,
  activeFrame,
  applyFrame,
  isShapeFilled,
  setIsShapeFilled,
  shapeFill,
  setShapeFill,
  annotationTool,
  addShapes,
  lineColor,
  lineWidth,
  handleLineWidthChange,
  handleAnnotationToolSelect,
  handleColorChange,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
}) => {
  if (!expandedPanel || !canvas) return null;

  const adjustments = [
    {
      id: "brightness",
      name: "Brightness",
      value: brightness,
      setValue: setBrightness,
      min: -1,
      max: 1,
      step: 0.1,
    },
    {
      id: "contrast",
      name: "Contrast",
      value: contrast,
      setValue: setContrast,
      min: -1,
      max: 1,
      step: 0.1,
    },
    {
      id: "saturation",
      name: "Saturation",
      value: saturation,
      setValue: setSaturation,
      min: -1,
      max: 1,
      step: 0.1,
    },
  ];

  switch (expandedPanel) {
    case "filter":
      return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
          <div className="flex justify-center space-x-3 overflow-x-auto pb-2 pt-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-btn ${
                  activeFilter === filter.id ? "active" : ""
                }`}
                onClick={() => applyFilter(filter.id)}
              >
                <div className="filter-img bg-gray-300"></div>
                <span className="text-xs text-white/80">{filter.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    case "adjust":
      return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
          <div className="flex flex-col items-center mb-4">
            <div className="flex flex-wrap justify-center mb-2">
              {adjustments.map((adjustment) => (
                <div key={adjustment.id} className="px-4 py-2">
                  <div className="text-white/80 text-sm mb-1">
                    {adjustment.name}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min={adjustment.min}
                      max={adjustment.max}
                      step={adjustment.step}
                      value={adjustment.value}
                      onChange={(e) =>
                        handleAdjustmentChange(
                          adjustment,
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-32 h-2 bg-editor-button rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white/70 text-xs ml-2">
                      {adjustment.value.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "crop":
      return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
          <div className="flex justify-center items-center mb-4">
            <button
              className="flex items-center justify-center gap-2 mx-2 px-4 py-1 rounded-md bg-editor-button text-white"
              onClick={handleRotateLeft}
            >
              <RotateCcw size={16} />
              Rotate left
            </button>

            <button
              className="flex items-center justify-center gap-2 mx-2 px-4 py-1 rounded-md bg-editor-button text-white"
              onClick={handleFlipHorizontal}
            >
              <FlipHorizontal size={16} />
              Flip horizontal
            </button>

            <button
              className="flex items-center justify-center gap-2 mx-2 px-4 py-1 rounded-md bg-editor-button text-white"
              onClick={() => setCropMode(!cropMode)}
            >
              <Crop size={16} />
              {cropMode ? "Cancel Crop" : "Crop shape"}
            </button>
          </div>

          {cropMode && (
            <div className="flex justify-center mb-4">
              <button
                className="bg-editor-accent text-editor-dark font-medium px-4 py-1 rounded-lg"
                onClick={handleApplyCrop}
              >
                Apply Crop
              </button>
            </div>
          )}
        </div>
      );
    case "masking":
      return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
          <div className="flex justify-center items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2  text-white bg-gray-700 rounded-3xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
              onClick={applyMask}
            >
              <CopyPlus size={20} />
              <span className="text-sm font-medium">Add Masking</span>
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700 rounded-3xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
              onClick={clearMasking}
            >
              <CopyX size={20} />
              <span className="text-sm font-medium">Clear Masking</span>
            </button>
          </div>
        </div>
      );
    case "frame":
      return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
          <div className="flex justify-center space-x-3 overflow-x-auto pb-2 pt-1">
            {frames.map((frame) => (
              <button
                key={frame.id}
                className={`filter-btn ${
                  activeFrame === frame.name ? "active" : ""
                }`}
                onClick={() => applyFrame(frame.name)}
              >
                <div className={`frame-img`}>
                  <span className="text-xs text-white/80">{frame.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    case "shapes":
      return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
          <div className="flex justify-center mb-1"></div>
          <div className="text-white/80 flex justify-center gap-4">
            <div className="flex items-center justify-center gap-2">
              <div>Fill Shape:</div>
              <div>
                <input
                  type="checkbox"
                  checked={isShapeFilled}
                  onChange={() => setIsShapeFilled(!isShapeFilled)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                ></input>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div>Shape Fill color:</div>
              <div>
                <input
                  type="color"
                  class="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                  value={shapeFill}
                  onChange={(e) => setShapeFill(e.target.value)}
                ></input>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4 py-4">
            {ShapesTools.map((shapes) => (
              <button
                key={shapes.id}
                className={`annotation-btn text-white/10 rounded-2xl ${
                  annotationTool === shapes.id ? "bg-white/10" : ""
                }`}
                onClick={() => addShapes(shapes.name)}
              >
                {shapes.icon}
                <span className="text-sm text-white/80">{shapes.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    case "annotate":
      return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
          <div className="flex justify-center items-center gap-4 mb-2">
            <div className="text-white/70 text-sm">line color</div>
            <div className="h-8 w-8 rounded-full border-2 border-white overflow-hidden">
              <div
                className="w-full h-full"
                style={{ backgroundColor: lineColor }}
              ></div>
            </div>

            <div className="ml-4 text-white/70 text-sm">line width</div>
            <div className="relative">
              <select
                value={lineWidth}
                onChange={(e) => handleLineWidthChange(e.target.value)}
                className="appearance-none bg-editor-button text-white px-3 py-1 rounded-lg pr-8"
              >
                {lineWidths.map((width) => (
                  <option key={width.id} value={width.id}>
                    {width.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mt-3">
            {annotationTools.map((tool) => (
              <button
                key={tool.id}
                className={`annotation-btn ${
                  annotationTool === tool.id ? "bg-white/10" : ""
                }`}
                onClick={() => handleAnnotationToolSelect(tool.id)}
              >
                {tool.icon}
                <span className="text-sm text-white/80">{tool.name}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center space-x-2 mt-4">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full ${
                  lineColor === color ? "ring-2 ring-white" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              ></button>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default ActivePanel;
