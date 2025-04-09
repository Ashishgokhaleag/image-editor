import React from "react";

const CanvasArea = ({ canvasRef, loading }) => {
  return (
    <div className="flex-1 overflow-hidden flex justify-center items-center p-4 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-10 h-10 border-4 border-editor-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className=" animate-fade-in">
        <canvas ref={canvasRef} className="shadow-lg" />
      </div>

      {!loading && !canvasRef.current && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
          <p className="text-lg mb-3">No image loaded</p>
          <p className="text-sm">Upload an image to get started</p>
        </div>
      )}
    </div>
  );
};

export default CanvasArea;
