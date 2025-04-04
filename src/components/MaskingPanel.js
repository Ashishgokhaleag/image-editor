import React, { useState } from 'react';
import { fabric } from 'fabric';
import { TestTube, Image, Eye, Cross, RemoveFormattingIcon, X } from 'lucide-react';

const MaskingPanel = ({ canvas, activeImage }) => {
  const [maskOpacity, setMaskOpacity] = useState(1);
  const [maskImage, setMaskImage] = useState(null);

  const handleMaskUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !canvas || !activeImage) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (maskImg) => {
        // Remove existing mask if any
        if (maskImage) {
          canvas.remove(maskImage);
        }

        // Set mask image properties
        maskImg.set({
          left: activeImage.left,
          top: activeImage.top,
          opacity: maskOpacity,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          transparentCorners: false,
          cornerColor: 'white',
          cornerSize: 10,
          padding: 5
        });

        // Scale mask to reasonable initial size
        const maxWidth = canvas.width * 0.8;
        const maxHeight = canvas.height * 0.8;
        if (maskImg.width > maxWidth || maskImg.height > maxHeight) {
          const scale = Math.min(maxWidth / maskImg.width, maxHeight / maskImg.height);
          maskImg.scale(scale);
        }

        // Add mask above the base image
        canvas.add(maskImg);
        canvas.setActiveObject(maskImg);
        setMaskImage(maskImg);
        canvas.renderAll();
        canvas.fire('object:modified');
      });
    };
    reader.readAsDataURL(file);
  };

  const handleOpacityChange = (value) => {
    setMaskOpacity(value);
    if (maskImage) {
      maskImage.set({ opacity: value });
      canvas.renderAll();
      canvas.fire('object:modified');
    }
  };

  const handleRemoveMask = () => {
    if (maskImage) {
      canvas.remove(maskImage);
      setMaskImage(null);
      canvas.renderAll();
      canvas.fire('object:modified');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 rounded-lg shadow-xl text-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gradient">Image Masking</h3>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Add Mask Button */}
          <label className="relative group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleMaskUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-500 rounded-xl hover:bg-blue-500/10 transition-all bg-blue-500/5">
              <Image size={24} className="mb-2 text-blue-500 group-hover:text-white" />
              <span className="text-sm font-medium text-blue-500 group-hover:text-white">
                Add Mask
              </span>
            </div>
          </label>

          {/* Clear Mask Button */}
          <button
            onClick={handleRemoveMask}
            className="flex flex-col items-center justify-center p-6 border-2 border-red-500 rounded-xl hover:bg-red-500/10 transition-all bg-red-500/5"
          >
            <X size={24} className="mb-2 text-red-500" />
            <span className="text-sm font-medium text-red-500">Clear Mask</span>
          </button>
        </div>

        {/* Opacity Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Eye className="mr-2" />
              Mask Opacity
            </label>
            <span className="text-sm text-gray-400">{Math.round(maskOpacity * 100)}%</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={maskOpacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-xs text-gray-400 mt-4">
          <p>Tip: Click and drag the mask to reposition. Use corners to resize.</p>
        </div>
      </div>
    </div>
  );
};

export default MaskingPanel;
