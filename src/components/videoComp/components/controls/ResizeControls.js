import { useState, RefObject, useEffect } from "react";
import { LockIcon, UnlockIcon, RotateCcw } from "lucide-react";
import { Button } from "../../../ui/Buttons";
import { Input } from "../../../ui/input";
import { Switch } from "../../../ui/switch";
import {
  ResizeOptions,
  calculateDimensions,
} from "../../../../lib/editorUtils";

const ResizeControls = ({
  mediaRef,
  mediaType,
  resizeOptions,
  onResizeChange,
  onApplyResize,
}) => {
  const [localOptions, setLocalOptions] = useState(resizeOptions);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setLocalOptions(resizeOptions);
  }, [resizeOptions]);

  useEffect(() => {
    if (mediaRef.current) {
      const element = mediaRef.current;

      const updateDimensions = () => {
        const naturalWidth =
          mediaType === "image" ? element.naturalWidth : element.videoWidth;
        const naturalHeight =
          mediaType === "image" ? element.naturalHeight : element.videoHeight;

        if (naturalWidth && naturalHeight) {
          setOriginalDimensions({
            width: naturalWidth,
            height: naturalHeight,
          });

          if (localOptions.width === 0 || localOptions.height === 0) {
            const initialOptions = {
              ...localOptions,
              width: naturalWidth,
              height: naturalHeight,
            };
            setLocalOptions(initialOptions);
            onResizeChange(initialOptions);
            onApplyResize(); // Auto apply on initial load
          }
        }
      };

      if (mediaType === "image") {
        if (element.complete) {
          updateDimensions();
        } else {
          element.addEventListener("load", updateDimensions);
          return () => element.removeEventListener("load", updateDimensions);
        }
      } else {
        if (element.readyState >= 1) {
          updateDimensions();
        } else {
          element.addEventListener("loadedmetadata", updateDimensions);
          return () =>
            element.removeEventListener("loadedmetadata", updateDimensions);
        }
      }
    }
  }, [mediaRef, mediaType]);

  const toggleAspectRatio = () => {
    const updated = {
      ...localOptions,
      maintainAspectRatio: !localOptions.maintainAspectRatio,
    };
    setLocalOptions(updated);
    onResizeChange(updated);
    onApplyResize(); // Apply change immediately
  };

  const handleWidthChange = (e) => {
    const width = parseInt(e.target.value) || 0;
    let updated;

    if (localOptions.maintainAspectRatio && originalDimensions.width > 0) {
      const { height } = calculateDimensions(
        originalDimensions.width,
        originalDimensions.height,
        width,
        null,
        true
      );
      updated = { ...localOptions, width, height };
    } else {
      updated = { ...localOptions, width };
    }

    setLocalOptions(updated);
    onResizeChange(updated);
    onApplyResize(); // Apply immediately
  };

  const handleHeightChange = (e) => {
    const height = parseInt(e.target.value) || 0;
    let updated;

    if (localOptions.maintainAspectRatio && originalDimensions.height > 0) {
      const { width } = calculateDimensions(
        originalDimensions.width,
        originalDimensions.height,
        null,
        height,
        true
      );
      updated = { ...localOptions, width, height };
    } else {
      updated = { ...localOptions, height };
    }

    setLocalOptions(updated);
    onResizeChange(updated);
    onApplyResize(); // Apply immediately
  };

  const applyPresetSize = (width, fallbackHeight) => {
    const height = localOptions.maintainAspectRatio
      ? Math.round((width * originalDimensions.height) / originalDimensions.width)
      : fallbackHeight;

    const updated = { ...localOptions, width, height };
    setLocalOptions(updated);
    onResizeChange(updated);
    onApplyResize(); // Apply immediately
  };

  const resetToOriginal = () => {
    const updated = {
      ...localOptions,
      width: originalDimensions.width,
      height: originalDimensions.height,
    };
    setLocalOptions(updated);
    onResizeChange(updated);
    onApplyResize(); // Apply immediately
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">
            Maintain Aspect Ratio
          </h4>
          <div className="flex items-center gap-2">
            {localOptions.maintainAspectRatio ? (
              <LockIcon className="h-4 w-4 text-primary" />
            ) : (
              <UnlockIcon className="h-4 w-4 text-gray-400" />
            )}
            <Switch
              checked={localOptions.maintainAspectRatio}
              onCheckedChange={toggleAspectRatio}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Width (px)</label>
            <Input
              type="number"
              value={localOptions.width || ""}
              onChange={handleWidthChange}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Width"
              min="1"
              max="8000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400">Height (px)</label>
            <Input
              type="number"
              value={localOptions.height || ""}
              onChange={handleHeightChange}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Height"
              min="1"
              max="8000"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white">Preset Sizes</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => applyPresetSize(1280, 720)}
          >
            HD(1280x720)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => applyPresetSize(1920, 1080)}
          >
            Full HD(1920x1080)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => applyPresetSize(1080, 1080)}
          >
            Instagram(1080x1080)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={resetToOriginal}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Original Size
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResizeControls;
