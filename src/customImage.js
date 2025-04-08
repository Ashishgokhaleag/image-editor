import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import "./index.css";
const ImageEditor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(20);
  const [savedImage, setSavedImage] = useState("");
  const [shapeFill, setShapeFill] = useState("#000000");
  const [isShapeFilled, setIsShapeFilled] = useState(true);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [penColor, setPenColor] = useState("#ff0000");
  const [penSize, setPenSize] = useState(5);
  const [cropRect, setCropRect] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [resolution, setResolution] = useState("standard"); // 'standard' or 'hd'
  const resolutions = {
    standard: { width: 1280, height: 720 },
    hd: { width: 1920, height: 1080 },
  };

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: "lightgray",
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    const enableTextEditing = (e) => {
      const activeObject = e.target;
      if (activeObject && activeObject.type === "i-text") {
        activeObject.enterEditing();
        activeObject.selectAll();
      }
    };

    canvas.on("mouse:dblclick", enableTextEditing);

    return () => {
      canvas.off("mouse:dblclick", enableTextEditing);
    };
  }, [canvas]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !canvas) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        canvas.clear();
        img.set({ left: 50, top: 50, selectable: false });
        img.scaleToWidth(canvas.width * 0.9);
        img.scaleToHeight(canvas.height * 0.9);
        canvas.add(img);
        canvas.sendToBack(img);
        setImageObj(img); // S
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleDrawingMode = () => {
    if (!canvas) return;
    setDrawingMode(!drawingMode);
    canvas.isDrawingMode = !canvas.isDrawingMode;
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = penColor;
      canvas.freeDrawingBrush.width = penSize;
    }
  };

  const saveImageAsBase64 = () => {
    if (!canvas) return;
    const base64 = canvas.toDataURL({ format: "png", quality: 1 });
    setSavedImage(base64);
    console.log("Base64 Image:", base64);
  };
  const addRectangle = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      width: 100,
      height: 60,
      fill: isShapeFilled ? shapeFill : "transparent",
      stroke: "black",
      strokeWidth: 2,
    });
    canvas.add(rect);
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 50,
      fill: isShapeFilled ? shapeFill : "transparent",
      stroke: "black",
      strokeWidth: 2,
    });
    canvas.add(circle);
  };
  const applyMask = () => {
    if (!canvas) return;
    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({ fill: "rgba(255,0,0,0.5)" });
      }
    });
    canvas.renderAll();
  };

  const clearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    }
  };

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Double-click to edit", {
      left: 100,
      top: 100,
      fontSize,
      fill: textColor,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      editable: true,
    });
    canvas.add(text);
  };

  const changeTextColor = (e) => {
    setTextColor(e.target.value);
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set("fill", e.target.value);
      canvas.renderAll();
    }
  };
  const updateTextStyle = (property, value) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set(property, value);
      canvas.renderAll();
    }
  };
  const changeFontSize = (e) => {
    const size = parseInt(e.target.value, 10);
    setFontSize(size);
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set("fontSize", size);
      canvas.renderAll();
    }
  };

  const downloadImage = () => {
    if (!savedImage) return;
    const link = document.createElement("a");
    link.href = savedImage;
    link.download = "edited-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleBold = () => {
    setIsBold(!isBold);
    updateTextStyle("fontWeight", !isBold ? "bold" : "normal");
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
    updateTextStyle("fontStyle", !isItalic ? "italic" : "normal");
  };

  const changePenColor = (e) => {
    setPenColor(e.target.value);
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = e.target.value;
    }
  };

  const changePenSize = (e) => {
    const size = parseInt(e.target.value, 10);
    setPenSize(size);
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = size;
    }
  };

  const startCrop = () => {
    if (!canvas || !imageObj) return;

    setIsCropping(true);

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: "rgba(255, 255, 255, 0.3)",
      stroke: "black",
      strokeWidth: 2,
      selectable: true,
      hasBorders: true,
      hasControls: true,
    });

    canvas.add(rect);
    setCropRect(rect);
  };

  const applyCrop = () => {
    if (!canvas || !imageObj || !cropRect) return;

    const { left, top, width, height } = cropRect;

    // Create cropped image using canvas.toDataURL
    const croppedCanvas = document.createElement("canvas");
    const ctx = croppedCanvas.getContext("2d");

    croppedCanvas.width = width;
    croppedCanvas.height = height;

    const originalCanvas = canvas.toCanvasElement(); // Convert fabric canvas to normal canvas
    ctx.drawImage(
      originalCanvas,
      left,
      top,
      width,
      height,
      0,
      0,
      width,
      height
    );

    const croppedDataUrl = croppedCanvas.toDataURL(); // Convert to base64 image

    fabric.Image.fromURL(croppedDataUrl, (croppedImg) => {
      croppedImg.set({
        left: 50,
        top: 50,
        selectable: false,
        hasBorders: false,
        hasControls: false,
      });

      croppedImg.scaleToWidth(canvas.width * 0.9);
      croppedImg.scaleToHeight(canvas.height * 0.9);

      canvas.clear();
      canvas.add(croppedImg);
      canvas.sendToBack(croppedImg);
      setImageObj(croppedImg);
    });

    setCropRect(null);
    setIsCropping(false);
  };

  const scaleImage = (img) => {
    const { width, height } = resolutions[resolution];

    const scaleFactor = Math.min(width / img.width, height / img.height);
    img.scale(scaleFactor);
  };

  const changeResolution = (res) => {
    if (!canvas) return;

    const { width, height } = resolutions[res];
    canvas.setWidth(width);
    canvas.setHeight(height);

    if (imageObj) {
      scaleImage(imageObj);
      canvas.renderAll();
    }

    setResolution(res);
  };

  const applyFilters = () => {
    if (!imageObj) return;

    imageObj.filters = [
      new fabric.Image.filters.Brightness({ brightness }),
      new fabric.Image.filters.Contrast({ contrast }),
    ];

    imageObj.applyFilters();
    canvas.renderAll();
  };

  const handleBrightnessChange = (e) => {
    const value = parseFloat(e.target.value);
    setBrightness(value);
    applyFilters();
  };

  const handleContrastChange = (e) => {
    const value = parseFloat(e.target.value);
    setContrast(value);
    applyFilters();
  };

  return (
    <div className="h-screen w-full overflow-x-auto bg-">
      <h2 >AI Image Editor</h2>
      <div className="editor">
        <div className="editortool">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <button onClick={toggleDrawingMode} className="te">
            {drawingMode ? "Disable Drawing" : "Enable Drawing"}
          </button>
          <label>
            Pen Color:
            <input type="color" value={penColor} onChange={changePenColor} />
          </label>

          <label>
            Pen Size:
            <input
              type="range"
              min="1"
              max="20"
              value={penSize}
              onChange={changePenSize}
            />
            {penSize}px
          </label>
          <label>
            Brightness:
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={brightness}
              onChange={handleBrightnessChange}
            />
          </label>

          <label>
            Contrast:
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={contrast}
              onChange={handleContrastChange}
            />
          </label>
          <button onClick={addText}>Add Text</button>

          <label>
            Text Color:
            <input type="color" value={textColor} onChange={changeTextColor} />
          </label>

          <label>
            Font Size:
            <select value={fontSize} onChange={changeFontSize}>
              {[10, 12, 14, 18, 24, 32, 40, 48, 56, 64].map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={toggleBold}
            style={{ fontWeight: isBold ? "bold" : "normal" }}
          >
            B
          </button>

          <button
            onClick={toggleItalic}
            style={{ fontStyle: isItalic ? "italic" : "normal" }}
          >
            I
          </button>
          <label>
            Shape Fill Color:
            <input
              type="color"
              value={shapeFill}
              onChange={(e) => setShapeFill(e.target.value)}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={isShapeFilled}
              onChange={() => setIsShapeFilled(!isShapeFilled)}
            />
            Fill Shape
          </label>

          <button onClick={addRectangle}>Add Rectangle</button>
          <button onClick={addCircle}>Add Circle</button>
          <button onClick={applyMask}>Apply Mask</button>
          <button onClick={clearCanvas}>Clear Canvas</button>
          <button onClick={startCrop} disabled={isCropping || !imageObj}>
            Start Crop
          </button>

          <button onClick={applyCrop} disabled={!cropRect}>
            Apply Crop
          </button>
          <button onClick={deleteSelected}>Delete Selected</button>
          <button onClick={saveImageAsBase64}>Save Image</button>
          <button onClick={downloadImage} disabled={!savedImage}>
            Download Image
          </button>
          <label>Resolution:</label>
          <select
            value={resolution}
            onChange={(e) => changeResolution(e.target.value)}
          >
            <option value="standard">Standard (1280x720)</option>
            <option value="hd">HD (1920x1080)</option>
          </select>
        </div>
        <div className="w-full flex justify-center border-2">
          <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
