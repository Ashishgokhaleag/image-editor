
import { useState, RefObject, useEffect } from "react";
import { Button } from "../../../ui/Buttons";
import { 
  Crop as CropIcon,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical
} from "lucide-react";

const CropControls = ({ 
  mediaRef, 
  mediaType, 
  cropOptions, 
  onCropChange, 
  onApplyCrop 
}) => {
  const [localCropOptions, setLocalCropOptions] = useState(cropOptions);

  // Update local state when prop changes
  useEffect(() => {
    setLocalCropOptions(cropOptions);
  }, [cropOptions]);

  const aspectRatios = [
    { label: "Free", value: null },
    { label: "1:1", value: "1:1" },
    { label: "4:3", value: "4:3" },
    { label: "16:9", value: "16:9" },
    { label: "9:16", value: "9:16" },
  ];

  const handleAspectRatioChange = (value) => {
    const newOptions = {
      ...localCropOptions,
      aspectRatio: value
    };
    setLocalCropOptions(newOptions);
    onCropChange(newOptions);
  };

  const handleRotate = (direction) => {
    const newRotation = 
      direction === "left" 
        ? (localCropOptions.rotation - 90) % 360 
        : (localCropOptions.rotation + 90) % 360;
    
    const newOptions = {
      ...localCropOptions,
      rotation: newRotation
    };
    
    setLocalCropOptions(newOptions);
    onCropChange(newOptions);
  };

  const handleFlip = (axis) => {
    const newFlip = {
      ...localCropOptions.flip,
      [axis]: !localCropOptions.flip[axis]
    };
    
    const newOptions = {
      ...localCropOptions,
      flip: newFlip
    };
    
    setLocalCropOptions(newOptions);
    onCropChange(newOptions);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Aspect Ratio</h4>
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map(ratio => (
            <Button
              key={ratio.label}
              variant={localCropOptions.aspectRatio === ratio.value ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleAspectRatioChange(ratio.value)}
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
      
      <div className="pt-4 border-t border-gray-800">
        <Button 
          className="w-full"
          onClick={onApplyCrop}
        >
          <CropIcon className="h-4 w-4 mr-1" />
          Apply Crop
        </Button>
      </div>
    </div>
  );
};

export default CropControls;
