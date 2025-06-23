// ObjectExtractor.jsx
import React, { useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { saveAs } from "file-saver";

const ObjectExtractorTensor = () => {
  const [imageURL, setImageURL] = useState(null);
  const [objects, setObjects] = useState([]);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const [padding, setPadding] = useState(10);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageURL(URL.createObjectURL(file));
      setObjects([]);
    }
  };

  const detectObjects = async () => {
    const model = await cocoSsd.load();
    const predictions = await model.detect(imageRef.current);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    ctx.drawImage(imageRef.current, 0, 0);

    const extracted = predictions.map((item, idx) => {
      const [x, y, width, height] = item.bbox;

      const padX = Math.max(0, x - padding);
      const padY = Math.max(0, y - padding);
      const padWidth = Math.min(canvas.width - padX, width + padding * 2);
      const padHeight = Math.min(canvas.height - padY, height + padding * 2);

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = padWidth;
      tempCanvas.height = padHeight;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.drawImage(
        canvas,
        padX,
        padY,
        padWidth,
        padHeight,
        0,
        0,
        padWidth,
        padHeight
      );

      return {
        id: idx,
        label: item.class,
        dataUrl: tempCanvas.toDataURL(),
      };
    });

    setObjects(extracted);
  };

  const download = (dataUrl, filename) => {
    saveAs(dataUrl, filename);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 border-b border-white pb-2">
          🧠 Image Object Extractor
        </h1>

        <label className="block mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0 file:text-sm file:font-semibold
              file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
          />
        </label>

        {/* <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Padding: <span className="font-mono">{padding}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={padding}
            onChange={(e) => setPadding(Number(e.target.value))}
            className="w-full"
          />
        </div> */}

        <button
          onClick={detectObjects}
          className="mb-6 inline-block px-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600"
        >
          🔍 Detect Objects
        </button>

        {imageURL && (
          <div className="bg-gray-900 p-4 rounded mb-6">
            <img
              ref={imageRef}
              src={imageURL}
              alt="Uploaded"
              className="w-full rounded shadow-lg border border-gray-700 mb-4"
            />

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {objects.length > 0 && (
          <div>
            <h2 className="text-xl font-medium mb-4">🎯 Detected Objects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {objects.map((obj) => (
                <div
                  key={obj.id}
                  className="bg-gray-800 border border-gray-600 p-4 rounded shadow-md"
                >
                  <img
                    src={obj.dataUrl}
                    alt={obj.label}
                    className="w-full h-auto rounded"
                  />
                  <p className="text-sm mt-3 text-gray-300">
                    Label: <span className="font-medium">{obj.label}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectExtractorTensor;
