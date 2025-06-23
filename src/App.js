import { useRef, useState, useEffect } from "react";
import { Canvas, FabricImage } from "fabric";
import { Upload, ImageIcon } from "lucide-react";

const Extractor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        width: 800,
        height: 600,
      });
      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);

  // Handle file upload
  const handleImageUpload = (file) => {
    if (!file || !canvas) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      FabricImage.fromURL(
        e.target.result,
        (img) => {
          // Clear previous image
          canvas.clear();

          // Calculate dimensions to fit nicely in canvas
          const maxWidth = 600;
          const maxHeight = 450;
          const scaleX = maxWidth / img.width;
          const scaleY = maxHeight / img.height;
          const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

          // Center the image
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const left = (canvas.width - scaledWidth) / 2;
          const top = (canvas.height - scaledHeight) / 2;

          img.set({
            left: left,
            top: top,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            hoverCursor: "default",
            moveCursor: "default",
          });

          canvas.add(img);
          canvas.renderAll();
          setActiveImage(img);
          setLoading(false);
        },
        { crossOrigin: "anonymous" }
      );
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleImageUpload(imageFile);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-6">
        <h1 className="text-3xl font-light tracking-wide">Image Editor</h1>
        <p className="text-gray-400 mt-2">Upload an image to get started</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Upload Area - Show when no image */}
          {!activeImage && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300
                ${
                  isDragOver
                    ? "border-white bg-gray-900"
                    : "border-gray-600 hover:border-gray-400"
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-gray-800">
                  <Upload size={32} className="text-gray-300" />
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">
                    Upload your image
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Drag and drop an image here, or click to browse
                  </p>

                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  >
                    <ImageIcon size={20} className="mr-2" />
                    Choose Image
                  </label>
                </div>

                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex flex-col items-center">
            {loading && (
              <div className="mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div
              className={`
                bg-white rounded-lg shadow-2xl transition-all duration-500
                ${
                  activeImage
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 hidden"
                }
              `}
            >
              <canvas ref={canvasRef} className="rounded-lg" />
            </div>

            {/* Image Controls - Show when image is loaded */}
            {activeImage && (
              <div className="mt-6 flex items-center space-x-4">
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                >
                  Upload New Image
                </label>

                <button className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                  Apply Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 px-8 py-4 text-center text-gray-500 text-sm">
        Drag and drop images or click to upload • Built with Fabric.js
      </div>
    </div>
  );
};

export default Extractor;
