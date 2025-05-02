import { useState, useEffect } from "react";
import { Button } from "../../../ui/Buttons";
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";

const CropControls = ({
  mediaRef,
  mediaType,
  cropOptions,
  onCropChange,
  onApplyCrop,
  onApplyCropRegion,
  onShowCropSelector,
  showCropSelector,
  onSetCropRegion,
  mediaDimensions,
}) => {
  const [localCropOptions, setLocalCropOptions] = useState(cropOptions);
  const [aspactedRatio, setAspactedRatio] = useState(false);

  useEffect(() => {
    setLocalCropOptions(cropOptions);
  }, [cropOptions]);

  const aspectRatios = [
    { label: "1:1", value: "1:1" },
    { label: "4:3", value: "4:3" },
    { label: "16:9", value: "16:9" },
    { label: "9:16", value: "9:16" },
  ];

  const handleAspectRatioChange = (value) => {
    setAspactedRatio(true);
    const newOptions = {
      ...localCropOptions,
      aspectRatio: value,
    };

    setLocalCropOptions(newOptions);
    onCropChange(newOptions);
    onApplyCrop();

    if (value && mediaRef.current) {
      const video = mediaRef.current;
      // Use the actual dimensions from mediaDimensions if available
      const videoWidth =
        mediaDimensions?.width || video.videoWidth || video.clientWidth;
      const videoHeight =
        mediaDimensions?.height || video.videoHeight || video.clientHeight;

      const [w, h] = value.split(":").map(Number);
      let cropW = videoWidth;
      let cropH = Math.round((cropW * h) / w);
      if (cropH > videoHeight) {
        cropH = videoHeight;
        cropW = Math.round((cropH * w) / h);
      }

      const cropX = Math.round((videoWidth - cropW) / 2);
      const cropY = Math.round((videoHeight - cropH) / 2);

      const region = {
        x: (cropX / videoWidth) * 100,
        y: (cropY / videoHeight) * 100,
        width: (cropW / videoWidth) * 100,
        height: (cropH / videoHeight) * 100,
      };

      if (onSetCropRegion) onSetCropRegion(region);
    }
  };

  const handleRotate = (direction) => {
    const newRotation =
      direction === "left"
        ? (localCropOptions.rotation - 90 + 360) % 360
        : (localCropOptions.rotation + 90) % 360;

    const newOptions = {
      ...localCropOptions,
      rotation: newRotation,
    };

    setLocalCropOptions(newOptions);
    onCropChange(newOptions);
    onApplyCrop();
  };

  const handleFlip = (axis) => {
    const newFlip = {
      ...localCropOptions.flip,
      [axis]: !localCropOptions.flip[axis],
    };

    const newOptions = {
      ...localCropOptions,
      flip: newFlip,
    };

    setLocalCropOptions(newOptions);
    onCropChange(newOptions);
    onApplyCrop();
  };

  const handleApplyCrop = () => {
    if (!aspactedRatio) {
      alert("Please select an aspect ratio before applying the crop.");
      return;
    }

    // Ensure crop region is within video bounds before applying
    if (mediaRef.current) {
      // Use the actual dimensions from mediaDimensions if available
      const videoWidth =
        mediaDimensions?.width ||
        mediaRef.current.videoWidth ||
        mediaRef.current.clientWidth;
      const videoHeight =
        mediaDimensions?.height ||
        mediaRef.current.videoHeight ||
        mediaRef.current.clientHeight;

      // Get current crop region and ensure it's within bounds
      const region = {
        x: Math.max(0, Math.min(100, onSetCropRegion ? cropOptions.x : 0)),
        y: Math.max(0, Math.min(100, onSetCropRegion ? cropOptions.y : 0)),
        width: Math.max(
          10,
          Math.min(100, onSetCropRegion ? cropOptions.width : 100)
        ),
        height: Math.max(
          10,
          Math.min(100, onSetCropRegion ? cropOptions.height : 100)
        ),
      };

      if (onSetCropRegion) onSetCropRegion(region);
    }

    onApplyCropRegion();
  };

  return (
    <div className="space-y-6 overflow-auto max-h-[calc(100vh-200px)]">
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Aspect Ratio</h4>
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map((ratio) => (
            <Button
              key={ratio.label}
              variant={
                localCropOptions.aspectRatio === ratio.value
                  ? "secondary"
                  : "outline"
              }
              size="sm"
              onClick={() => {
                onShowCropSelector(); // Always show crop selector
                handleAspectRatioChange(ratio.value); // Update crop region
              }}
              className={`${
                localCropOptions.aspectRatio === ratio.value
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {ratio.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white mb-3">Rotation & Flip</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate("left")}
            className="text-gray-400 hover:text-white"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Rotate Left
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate("right")}
            className="text-gray-400 hover:text-white"
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Rotate Right
          </Button>

          <Button
            variant={localCropOptions.flip.horizontal ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleFlip("horizontal")}
            className={`${
              localCropOptions.flip.horizontal
                ? "bg-editor-control text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FlipHorizontal className="h-4 w-4 mr-1" />
            Flip H
          </Button>

          <Button
            variant={localCropOptions.flip.vertical ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleFlip("vertical")}
            className={`${
              localCropOptions.flip.vertical
                ? "bg-editor-control text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FlipVertical className="h-4 w-4 mr-1" />
            Flip V
          </Button>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleApplyCrop}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300"
        >
          Apply Crop
        </Button>
      </div>
    </div>
  );
};

export default CropControls;
