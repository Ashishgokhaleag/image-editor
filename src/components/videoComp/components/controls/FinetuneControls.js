import { Slider } from "../../../ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Button } from "../../../ui/Buttons";
import { RotateCcw } from "lucide-react";

const FinetuneControls = ({
  mediaRef,
  mediaType,
  adjustments,
  onAdjustmentChange,
  onResetAdjustments,
  onApplyFinetune,
}) => {
  console.log(adjustments, "adjustments in FinetuneControls");

  const handleAdjustmentChange = (adjustment, values) => {
    const updatedAdjustments = {
      ...adjustments,
      [adjustment]: values[0],
    };

    onAdjustmentChange(updatedAdjustments);

    if (mediaRef.current) {
      let filterString = "";

      if (updatedAdjustments.brightness !== 0) {
        filterString += `brightness(${
          1 + updatedAdjustments.brightness / 100
        }) `;
      }
      if (updatedAdjustments.contrast !== 0) {
        filterString += `contrast(${1 + updatedAdjustments.contrast / 100}) `;
      }
      if (updatedAdjustments.saturation !== 0) {
        filterString += `saturate(${1 + updatedAdjustments.saturation / 100}) `;
      }
      if (updatedAdjustments.exposure !== 0) {
        filterString += `brightness(${1 + updatedAdjustments.exposure / 100}) `;
      }
      if (updatedAdjustments.gamma !== 0) {
        filterString += `contrast(${
          1 + updatedAdjustments.gamma / 200
        }) saturate(${1 + updatedAdjustments.gamma / 200}) `;
      }
      if (updatedAdjustments.clarity !== 0) {
        filterString += `contrast(${
          1 + updatedAdjustments.clarity / 200
        }) saturate(${1 + updatedAdjustments.clarity / 100}) `;
      }
      if (updatedAdjustments.vignette !== 0) {
        // Vignette effect is applied through a combination of filters
        filterString += `brightness(${
          1 - Math.abs(updatedAdjustments.vignette) / 200
        }) `;
      }

      mediaRef.current.style.filter = filterString.trim() || "none";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Adjust Parameters</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetAdjustments}
          className="text-gray-400 hover:text-white h-7 px-2"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Brightness</label>
              <span className="text-xs text-gray-400">
                {adjustments.brightness > 0 ? "+" : ""}
                {adjustments.brightness}
              </span>
            </div>
            <Slider
              value={[adjustments.brightness]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(values) =>
                handleAdjustmentChange("brightness", values)
              }
              className="range-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Contrast</label>
              <span className="text-xs text-gray-400">
                {adjustments.contrast > 0 ? "+" : ""}
                {adjustments.contrast}
              </span>
            </div>
            <Slider
              value={[adjustments.contrast]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(values) =>
                handleAdjustmentChange("contrast", values)
              }
              className="range-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Saturation</label>
              <span className="text-xs text-gray-400">
                {adjustments.saturation > 0 ? "+" : ""}
                {adjustments.saturation}
              </span>
            </div>
            <Slider
              value={[adjustments.saturation]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(values) =>
                handleAdjustmentChange("saturation", values)
              }
              className="range-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Exposure</label>
              <span className="text-xs text-gray-400">
                {adjustments.exposure > 0 ? "+" : ""}
                {adjustments.exposure}
              </span>
            </div>
            <Slider
              value={[adjustments.exposure]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(values) =>
                handleAdjustmentChange("exposure", values)
              }
              className="range-input"
            />
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Temperature</label>
              <span className="text-xs text-gray-400">
                {adjustments.temperature > 0 ? "+" : ""}
                {adjustments.temperature}
              </span>
            </div>
            <Slider
              value={[adjustments.temperature]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(values) =>
                handleAdjustmentChange("temperature", values)
              }
              className="range-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Gamma</label>
              <span className="text-xs text-gray-400">
                {adjustments.gamma > 0 ? "+" : ""}
                {adjustments.gamma}
              </span>
            </div>
            <Slider
              value={[adjustments.gamma]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(values) =>
                handleAdjustmentChange("gamma", values)
              }
              className="range-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Clarity</label>
              <span className="text-xs text-gray-400">
                {adjustments.clarity > 0 ? "+" : ""}
                {adjustments.clarity}
              </span>
            </div>
            <Slider
              value={[adjustments.clarity]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(values) =>
                handleAdjustmentChange("clarity", values)
              }
              className="range-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Vignette</label>
              <span className="text-xs text-gray-400">
                {adjustments.vignette > 0 ? "+" : ""}
                {adjustments.vignette}
              </span>
            </div>
            <Slider
              value={[adjustments.vignette]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(values) =>
                handleAdjustmentChange("vignette", values)
              }
              className="range-input"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinetuneControls;
