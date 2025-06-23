import React, { useRef, useState, useEffect } from "react";
import { saveAs } from "file-saver";

const OpenCVObjectExtractor = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [extractedShapes, setExtractedShapes] = useState([]);
  const imageRef = useRef(null);
  const [cvReady, setCvReady] = useState(false);
  const [padding, setPadding] = useState(10); // default 10px padding

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.cv && window.cv.imread) {
        window.cv["onRuntimeInitialized"] = () => {
          console.log("OpenCV.js is ready.");
          setCvReady(true);
        };
        clearInterval(interval);
      }
    }, 100);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setExtractedShapes([]);
    }
  };

  const extractShapes = () => {
    if (!cvReady) return;

    const cv = window.cv;
    const imgElement = imageRef.current;
    const src = cv.imread(imgElement);
    const gray = new cv.Mat();
    const dst = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.adaptiveThreshold(
      gray,
      dst,
      255,
      cv.ADAPTIVE_THRESH_MEAN_C,
      cv.THRESH_BINARY_INV,
      11,
      2
    );

    // Detect ALL contours
    cv.findContours(
      dst,
      contours,
      hierarchy,
      cv.RETR_TREE,
      cv.CHAIN_APPROX_SIMPLE
    );

    const extracted = [];

    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const rect = cv.boundingRect(cnt);
      const { x, y, width, height } = rect;

      if (width < 20 || height < 20) continue;

      // Add padding around the shape
      const pad = padding; // assume from useState
      const px = Math.max(x - pad, 0);
      const py = Math.max(y - pad, 0);
      const pw = Math.min(src.cols - px, width + pad * 2);
      const ph = Math.min(src.rows - py, height + pad * 2);

      const roi = src.roi(new cv.Rect(px, py, pw, ph));
      const roiCanvas = document.createElement("canvas");
      roiCanvas.width = pw;
      roiCanvas.height = ph;

      const roiMat = new cv.Mat();
      roi.copyTo(roiMat);
      cv.imshow(roiCanvas, roiMat);
      const dataUrl = roiCanvas.toDataURL();

      extracted.push({ id: i, dataUrl });

      roiMat.delete();
      roi.delete();
      cnt.delete();
    }

    src.delete();
    dst.delete();
    gray.delete();
    contours.delete();
    hierarchy.delete();

    setExtractedShapes(extracted);
  };

  return (
    <div className="bg-white min-h-screen text-black px-6 py-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 border-b pb-2">
          🖼️ Shape/Object Extractor
        </h1>

        <label className="block mb-6">
          <span className="text-sm font-medium mb-2 block">
            Upload an image:
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="block w-full text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
          />
        </label>

        {imageSrc && (
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2">Original Image:</p>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Uploaded"
              crossOrigin="anonymous"
              onLoad={extractShapes}
              className="w-full max-w-lg border border-gray-300 rounded shadow-sm"
            />
          </div>
        )}

        {extractedShapes?.length > 0 && (
          <>
            <h2 className="text-xl font-medium mb-4">
              Extracted Shapes ({extractedShapes?.length}):
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {extractedShapes?.map((shape) => (
                <div
                  key={shape?.id}
                  className="border rounded-lg p-2 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <img
                    src={shape?.dataUrl}
                    alt={`Shape ${shape?.id}`}
                    className="w-full rounded mb-2"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OpenCVObjectExtractor;
