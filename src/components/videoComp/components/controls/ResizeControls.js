import { useState, useEffect } from "react";
import { LockIcon, UnlockIcon, RotateCcw } from "lucide-react";
import { Button } from "../../../ui/Buttons";
import { Input } from "../../../ui/input";
import { Switch } from "../../../ui/switch";
import { calculateDimensions, forceReflow } from "../../../../lib/editorUtils";

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
  const [containerStyle, setContainerStyle] = useState({});

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

          // Only set initial dimensions if they're not already set
          if (
            !localOptions.width ||
            !localOptions.height ||
            localOptions.width === 0 ||
            localOptions.height === 0
          ) {
            const initialOptions = {
              ...localOptions,
              width: naturalWidth,
              height: naturalHeight,
            };
            setLocalOptions(initialOptions);
            onResizeChange(initialOptions);
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

  // Apply resize immediately whenever localOptions change
  useEffect(() => {
    if (localOptions.width > 0 && localOptions.height > 0) {
      applyResizeImmediately(localOptions);
    }
  }, [localOptions]);

  const toggleAspectRatio = () => {
    const updated = {
      ...localOptions,
      maintainAspectRatio: !localOptions.maintainAspectRatio,
    };
    setLocalOptions(updated);
    onResizeChange(updated);
    applyResizeImmediately(updated);
  };

  const handleWidthChange = (e) => {
    const widthValue = e.target.value;
    const width = Number.parseInt(widthValue, 10) || 0;

    let updated;
    if (localOptions.maintainAspectRatio && originalDimensions.width > 0) {
      const newDimensions = calculateDimensions(
        originalDimensions.width,
        originalDimensions.height,
        width,
        null,
        true
      );
      updated = {
        ...localOptions,
        width: newDimensions.width,
        height: newDimensions.height,
      };
    } else {
      updated = { ...localOptions, width };
    }

    setLocalOptions(updated);
    onResizeChange(updated);
  };

  const handleHeightChange = (e) => {
    const heightValue = e.target.value;
    const height = Number.parseInt(heightValue, 10) || 0;

    let updated;
    if (localOptions.maintainAspectRatio && originalDimensions.height > 0) {
      const newDimensions = calculateDimensions(
        originalDimensions.width,
        originalDimensions.height,
        null,
        height,
        true
      );
      updated = {
        ...localOptions,
        width: newDimensions.width,
        height: newDimensions.height,
      };
    } else {
      updated = { ...localOptions, height };
    }

    setLocalOptions(updated);
    onResizeChange(updated);
  };

  const applyResizeImmediately = (options) => {
    const targetOptions = options || localOptions;

    // Get the canvas reference through mediaRef's parent
    if (mediaRef.current && mediaRef.current.parentNode) {
      const canvasElem = mediaRef.current.parentNode.querySelector("canvas");

      if (canvasElem && targetOptions?.width && targetOptions?.height) {
        // Apply the new dimensions to the canvas
        canvasElem.style.width = `${targetOptions.width}px`;
        canvasElem.style.height = `${targetOptions.height}px`;

        // Determine if we need to zoom based on container size
        const containerElem = canvasElem.parentNode;
        if (containerElem) {
          const containerRect = containerElem.getBoundingClientRect();
          const isOverflowingWidth = targetOptions.width > containerRect.width;
          const isOverflowingHeight =
            targetOptions.height > containerRect.height;

          if (isOverflowingWidth || isOverflowingHeight) {
            // Need to zoom out to fit
            canvasElem.style.maxWidth = "100%";
            canvasElem.style.maxHeight = "100%";
            canvasElem.style.objectFit = "contain";
          } else {
            // No zoom needed
            canvasElem.style.maxWidth = "none";
            canvasElem.style.maxHeight = "none";
          }
        }

        // Force a reflow to ensure the changes are applied immediately
        forceReflow(canvasElem);
      }

      // Always update the video element dimensions too
      if (mediaRef.current) {
        mediaRef.current.style.width = targetOptions.width
          ? `${targetOptions.width}px`
          : "auto";
        mediaRef.current.style.height = targetOptions.height
          ? `${targetOptions.height}px`
          : "auto";
        forceReflow(mediaRef.current);
      }
    }

    // Call the parent component's apply function to save the state
    if (onApplyResize) {
      onApplyResize(targetOptions);
    }
  };

  const applyPresetSize = (width, fallbackHeight) => {
    const newWidth = width;
    let newHeight;

    if (localOptions.maintainAspectRatio && originalDimensions.width > 0) {
      // Calculate height based on original aspect ratio
      const newDimensions = calculateDimensions(
        originalDimensions.width,
        originalDimensions.height,
        newWidth,
        null,
        true
      );
      newHeight = newDimensions.height;
    } else {
      newHeight = fallbackHeight;
    }

    const updated = { ...localOptions, width: newWidth, height: newHeight };
    setLocalOptions(updated);
    onResizeChange(updated);
    applyResizeImmediately(updated);
  };

  const resetToOriginal = () => {
    if (originalDimensions.width === 0 || originalDimensions.height === 0) {
      return; // Don't reset if we don't have original dimensions
    }

    const updated = {
      ...localOptions,
      width: originalDimensions.width,
      height: originalDimensions.height,
    };
    setLocalOptions(updated);
    onResizeChange(updated);
    applyResizeImmediately(updated);
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
