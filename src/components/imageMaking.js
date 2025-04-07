import { useState } from "react";
import MaskingPanel from "./MaskingPanel";
import { CopyPlus, CopyX, ImagePlus } from "lucide-react";

export const ImageMasking = ({
  activeImage,
  canvas,
  applyMask,
  clearMasking,
}) => {
  const [isMaskingPanelVisible, setMaskingPanelVisible] = useState(false); // Move this outside of switch case

  // Function to handle the click event for "Load Mask Image" button
  const handleLoadMaskImageClick = () => {
    setMaskingPanelVisible(!isMaskingPanelVisible); // Show the MaskingPanel
  };

  // Add other code here...

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
      {isMaskingPanelVisible && (
        <MaskingPanel activeImage={activeImage} canvas={canvas} />
      )}
      <div className="flex justify-center items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700 rounded-3xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
            onClick={applyMask}
          >
            <CopyPlus size={20} />
            <span className="text-sm font-medium">Add Masking</span>
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700 rounded-3xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
            onClick={handleLoadMaskImageClick} // Show the MaskingPanel
          >
            <ImagePlus size={20} />
            <span className="text-sm font-medium">Load Mask Image</span>
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
    </div>
  );
};
