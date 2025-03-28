import React, { useState, useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import {
  Crop,
  RotateCcw,
  Redo,
  Minus,
  Plus,
  FlipHorizontal,
} from "lucide-react";
import {
  annotationTools,
  colors,
  filters,
  lineWidths,
  stickers,
  tools,
} from "./constant";

const Data = () => {
  // Main canvas state
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [activeTool, setActiveTool] = useState("");
  const [zoom, setZoom] = useState(56);
  const [loading, setLoading] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Filter panel state
  const [activeFilter, setActiveFilter] = useState("default");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  // Crop panel state
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const [angle, setAngle] = useState(0);
  const [activeTab, setActiveTab] = useState("rotation");

  // Annotate panel state
  const [annotationTool, setAnnotationTool] = useState("sharpie");
  const [lineColor, setLineColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState("small");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imageObj, setImageObj] = useState(null);

  const adjustments = [
    {
      id: "brightness",
      name: "Brightness",
      value: brightness,
      setValue: setBrightness,
      min: -1,
      max: 1,
      step: 0.1,
    },
    {
      id: "contrast",
      name: "Contrast",
      value: contrast,
      setValue: setContrast,
      min: -1,
      max: 1,
      step: 0.1,
    },
    {
      id: "saturation",
      name: "Saturation",
      value: saturation,
      setValue: setSaturation,
      min: -1,
      max: 1,
      step: 0.1,
    },
  ];

  // Initialize canvas
  // useEffect(() => {
  //   if (!canvasRef.current) return;

  //   const fabricCanvas = new fabric.Canvas(canvasRef.current, {
  //     width:
  //       window.innerWidth > 1200
  //         ? 1000
  //         : Math.min(window.innerWidth - 100, 800),
  //     height: window.innerWidth > 1200 ? 600 : 500,
  //     backgroundColor: "#f0f0f0",
  //     preserveObjectStacking: true,
  //     selection: true,
  //   });

  //   fabricCanvas.defaultCursor = "default";
  //   setCanvas(fabricCanvas);

  //   const handleResize = () => {
  //     const width =
  //       window.innerWidth > 1200
  //         ? 1000
  //         : Math.min(window.innerWidth - 100, 800);
  //     const height = window.innerWidth > 1200 ? 600 : 500;

  //     fabricCanvas.setWidth(width);
  //     fabricCanvas.setHeight(height);
  //     fabricCanvas.calcOffset();
  //     fabricCanvas.renderAll();
  //   };

  //   window.addEventListener("resize", handleResize);

  //   return () => {
  //     fabricCanvas.dispose();
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  // Save canvas state to history

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

  const saveCanvasState = useCallback(() => {
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());
    setHistory((prev) => {
      const newHistory = [...prev.slice(0, historyIndex + 1), json];
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [canvas, historyIndex]);

  // Load canvas state from history
  const loadCanvasState = useCallback(
    (index) => {
      if (!canvas || !history[index]) return;

      canvas.loadFromJSON(JSON.parse(history[index]), () => {
        canvas.renderAll();
        setHistoryIndex(index);

        // Find and set the active image
        canvas.getObjects().forEach((obj) => {
          if (obj.type === "image") {
            setActiveImage(obj);
          }
        });
      });
    },
    [canvas, history]
  );

  // Setup canvas events
  useEffect(() => {
    if (!canvas) return;

    const handleObjectModified = () => {
      saveCanvasState();
    };

    const handleObjectAdded = (e) => {
      const object = e.target;
      if (object.type === "image" && !activeImage) {
        setActiveImage(object);
      }
      saveCanvasState();
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:added", handleObjectAdded);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:added", handleObjectAdded);
    };
  }, [canvas, saveCanvasState, activeImage]);

  // Initialize history when canvas is first created
  useEffect(() => {
    if (canvas && history.length === 0) {
      saveCanvasState();
    }
  }, [canvas, history.length, saveCanvasState]);

  // Welcome message
  // useEffect(() => {
  //   toast("Welcome to Flux Editor", {
  //     description: "Upload an image to start editing",
  //     duration: 3000,
  //   });
  // }, []);

  // Handle image upload
  // const handleImageUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (!file || !canvas) return;

  //   setImageFile(file);

  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     fabric.Image.fromURL(e.target.result, (img) => {
  //       canvas.clear();
  //       img.set({ left: 50, top: 50, selectable: false });
  //       img.scaleToWidth(canvas.width * 0.9);
  //       img.scaleToHeight(canvas.height * 0.9);
  //       canvas.add(img);
  //       canvas.sendToBack(img);
  //       setImageObj(img); // S
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !canvas) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        canvas.clear(); // Clears the canvas before adding the new image

        // Position image at the center of the canvas
        const center = canvas.getCenter(); // Get canvas center coordinates
        img.set({
          left: center.left - img.width / 2, // Centering the image
          top: center.top - img.height / 2, // Centering the image
          selectable: false,
        });

        img.scaleToWidth(canvas.width * 0.9); // Scale the image to fit within the canvas width
        img.scaleToHeight(canvas.height * 0.9); // Scale the image to fit within the canvas height
        canvas.add(img); // Add the image to the canvas
        canvas.sendToBack(img); // Send the image to the background layer
        setImageObj(img); // Store the image object
        canvas.renderAll(); // Ensure the canvas renders the updated image
      });
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  };

  // Handle tool selection
  const handleToolSelect = (tool) => {
    if (tool === activeTool) {
      setActiveTool("");
      setExpandedPanel(null);
    } else {
      setActiveTool(tool);
      setExpandedPanel(tool);
    }
  };

  // Clear canvas event handlers when switching tools
  useEffect(() => {
    if (!canvas) return;

    // Remove any existing listeners when tool changes
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");

    if (cropMode && activeImage) {
      // Create crop rectangle
      if (!cropRect) {
        const rect = new fabric.Rect({
          left: canvas.width / 4,
          top: canvas.height / 4,
          width: canvas.width / 2,
          height: canvas.height / 2,
          fill: "rgba(255,255,255,0.2)",
          stroke: "rgba(255,255,255,0.8)",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          cornerColor: "white",
          cornerSize: 10,
          transparentCorners: false,
          hasRotatingPoint: false,
        });

        canvas.add(rect);
        canvas.setActiveObject(rect);
        setCropRect(rect);
      }
    } else if (cropRect && !cropMode) {
      canvas.remove(cropRect);
      setCropRect(null);
    }

    if (expandedPanel === "annotate") {
      if (
        annotationTool === "line" ||
        annotationTool === "rectangle" ||
        annotationTool === "ellipse" ||
        annotationTool === "arrow"
      ) {
        setupShapeDrawingHandlers();
      } else if (
        annotationTool === "sharpie" ||
        annotationTool === "eraser" ||
        annotationTool === "path"
      ) {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color =
          annotationTool === "eraser" ? "#ffffff" : lineColor;
        canvas.freeDrawingBrush.width =
          annotationTool === "eraser"
            ? 20
            : lineWidths.find((w) => w.id === lineWidth)?.value || 2;
      } else {
        canvas.isDrawingMode = false;
      }

      if (annotationTool === "text") {
        // Add text to canvas
        const text = new fabric.IText("Double-click to edit", {
          left: 100,
          top: 100,
          fontFamily: "Arial",
          fill: lineColor,
          fontSize: 20,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        saveCanvasState();
      }
    } else {
      canvas.isDrawingMode = false;
    }

    return () => {
      if (canvas) {
        canvas.off("mouse:down");
        canvas.off("mouse:move");
        canvas.off("mouse:up");
      }
    };
  }, [
    expandedPanel,
    annotationTool,
    lineColor,
    lineWidth,
    canvas,
    cropMode,
    activeImage,
    cropRect,
    saveCanvasState,
  ]);

  // Annotation: Setup shape drawing handlers
  const setupShapeDrawingHandlers = () => {
    if (!canvas) return;

    let tempShape = null;

    canvas.on("mouse:down", (o) => {
      const pointer = canvas.getPointer(o.e);
      setIsDrawing(true);
      setStartPoint({ x: pointer.x, y: pointer.y });

      const widthValue = lineWidths.find((w) => w.id === lineWidth)?.value || 2;

      if (annotationTool === "line") {
        tempShape = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: lineColor,
            strokeWidth: widthValue,
            selectable: false,
          }
        );
        canvas.add(tempShape);
      } else if (annotationTool === "rectangle") {
        tempShape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: lineColor,
          strokeWidth: widthValue,
          selectable: false,
        });
        canvas.add(tempShape);
      } else if (annotationTool === "ellipse") {
        tempShape = new fabric.Ellipse({
          left: pointer.x,
          top: pointer.y,
          rx: 0,
          ry: 0,
          fill: "transparent",
          stroke: lineColor,
          strokeWidth: widthValue,
          selectable: false,
        });
        canvas.add(tempShape);
      } else if (annotationTool === "arrow") {
        // Create a line for the arrow
        tempShape = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: lineColor,
            strokeWidth: widthValue,
            selectable: false,
          }
        );
        canvas.add(tempShape);
      }
    });

    canvas.on("mouse:move", (o) => {
      if (!isDrawing || !startPoint || !tempShape) return;

      const pointer = canvas.getPointer(o.e);

      if (annotationTool === "line" || annotationTool === "arrow") {
        const line = tempShape;
        line.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      } else if (annotationTool === "rectangle") {
        const rect = tempShape;
        const width = Math.abs(pointer.x - startPoint.x);
        const height = Math.abs(pointer.y - startPoint.y);

        rect.set({
          left: Math.min(pointer.x, startPoint.x),
          top: Math.min(pointer.y, startPoint.y),
          width: width,
          height: height,
        });
      } else if (annotationTool === "ellipse") {
        const ellipse = tempShape;
        const rx = Math.abs(pointer.x - startPoint.x) / 2;
        const ry = Math.abs(pointer.y - startPoint.y) / 2;

        ellipse.set({
          left: Math.min(pointer.x, startPoint.x) + rx,
          top: Math.min(pointer.y, startPoint.y) + ry,
          rx: rx,
          ry: ry,
          originX: "center",
          originY: "center",
        });
      }

      canvas.renderAll();
    });

    canvas.on("mouse:up", () => {
      setIsDrawing(false);
      setStartPoint(null);

      if (tempShape) {
        if (annotationTool === "arrow" && tempShape instanceof fabric.Line) {
          // Add arrowhead
          const dx = tempShape.x2 - tempShape.x1;
          const dy = tempShape.y2 - tempShape.y1;
          const angle = Math.atan2(dy, dx);

          const headLength = 15;
          const headWidth = 15;

          const x2 = tempShape.x2;
          const y2 = tempShape.y2;

          // Create arrowhead
          const triangle = new fabric.Triangle({
            left: x2,
            top: y2,
            width: headWidth,
            height: headLength,
            fill: lineColor,
            angle: (angle * 180) / Math.PI + 90,
            originX: "center",
            originY: "bottom",
          });

          // Group the line and arrowhead
          const group = new fabric.Group([tempShape, triangle], {
            selectable: true,
            hasControls: true,
          });

          canvas.remove(tempShape);
          canvas.add(group);
        }

        tempShape.set({
          selectable: true,
          hasControls: true,
        });

        canvas.renderAll();
        saveCanvasState();
      }

      tempShape = null;
    });
  };

  // Handle undo/redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      loadCanvasState(historyIndex - 1);
    }
  }, [historyIndex, loadCanvasState]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      loadCanvasState(historyIndex + 1);
    }
  }, [historyIndex, history.length, loadCanvasState]);

  // Handle zoom
  const handleZoom = (newZoom) => {
    if (!canvas) return;

    setZoom(newZoom);

    const center = canvas.getCenter();
    canvas.zoomToPoint({ x: center.left, y: center.top }, newZoom / 100);
    canvas.renderAll();
  };

  // Handle zoom in/out
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200);
    handleZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 10);
    handleZoom(newZoom);
  };

  // Handle save image
  const handleSaveImage = () => {
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
    });

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // toast.success("Image saved successfully!");
  };

  // Filter panel: Apply filter
  const applyFilter = (filterId) => {
    if (!activeImage) return;

    setActiveFilter(filterId);

    // Reset adjustments
    setBrightness(0);
    setContrast(0);
    setSaturation(0);

    // Remove existing filters
    activeImage.filters = [];

    // Apply the selected filter
    switch (filterId) {
      case "chrome":
        activeImage.filters.push(
          new fabric.Image.filters.Contrast({ contrast: 0.1 }),
          new fabric.Image.filters.Saturation({ saturation: 0.3 })
        );
        break;
      case "fade":
        activeImage.filters.push(
          new fabric.Image.filters.Contrast({ contrast: -0.15 }),
          new fabric.Image.filters.Saturation({ saturation: -0.2 })
        );
        break;
      case "cold":
        activeImage.filters.push(
          new fabric.Image.filters.Saturation({ saturation: 0.1 }),
          new fabric.Image.filters.Contrast({ contrast: 0.1 })
        );
        break;
      case "warm":
        activeImage.filters.push(
          new fabric.Image.filters.Saturation({ saturation: 0.2 }),
          new fabric.Image.filters.Brightness({ brightness: 0.05 })
        );
        break;
      case "pastel":
        activeImage.filters.push(
          new fabric.Image.filters.Saturation({ saturation: -0.3 }),
          new fabric.Image.filters.Brightness({ brightness: 0.1 })
        );
        break;
      case "mono":
        activeImage.filters.push(new fabric.Image.filters.Grayscale());
        break;
      case "noir":
        activeImage.filters.push(
          new fabric.Image.filters.Grayscale(),
          new fabric.Image.filters.Contrast({ contrast: 0.3 })
        );
        break;
      case "stark":
        activeImage.filters.push(
          new fabric.Image.filters.Contrast({ contrast: 0.5 }),
          new fabric.Image.filters.Saturation({ saturation: -0.2 })
        );
        break;
      case "wash":
        activeImage.filters.push(
          new fabric.Image.filters.Contrast({ contrast: -0.2 }),
          new fabric.Image.filters.Brightness({ brightness: 0.2 })
        );
        break;
    }

    // activeImage.applyFilters();
    canvas.renderAll();
    saveCanvasState();
  };

  // Filter panel: Apply adjustments
  const applyAdjustments = () => {
    if (!activeImage) return;

    // Apply adjustments on top of any existing filter
    activeImage.filters = activeImage.filters || [];

    // Remove any existing adjustment filters of the same type
    activeImage.filters = activeImage.filters.filter(
      (filter) =>
        !(filter instanceof fabric.Image.filters.Brightness) &&
        !(filter instanceof fabric.Image.filters.Contrast) &&
        !(filter instanceof fabric.Image.filters.Saturation)
    );

    // Add current adjustments
    if (brightness !== 0) {
      activeImage.filters.push(
        new fabric.Image.filters.Brightness({ brightness })
      );
    }

    if (contrast !== 0) {
      activeImage.filters.push(new fabric.Image.filters.Contrast({ contrast }));
    }

    if (saturation !== 0) {
      activeImage.filters.push(
        new fabric.Image.filters.Saturation({ saturation })
      );
    }

    activeImage.applyFilters();
    canvas.renderAll();
    saveCanvasState();
  };

  // Filter panel: Handle adjustment change
  const handleAdjustmentChange = (adjustment, value) => {
    adjustment.setValue(value);
  };

  // Annotate panel: Apply crop
  const handleRotateLeft = () => {
    if (!activeImage) return;

    const newAngle = (angle - 90) % 360;
    setAngle(newAngle);

    activeImage.rotate(newAngle);
    canvas.renderAll();
    saveCanvasState();
  };

  // Annotate panel: Flip horizontal
  const handleFlipHorizontal = () => {
    if (!activeImage) return;

    activeImage.set("flipX", !activeImage.flipX);
    canvas.renderAll();
    saveCanvasState();
  };

  // Annotate panel: Apply crop
  const handleApplyCrop = () => {
    if (!canvas || !activeImage || !cropRect) return;

    // Get the crop rectangle's position and dimensions
    const rect = cropRect.getBoundingRect();

    // Calculate crop coordinates relative to the image
    const imgElement = activeImage.getElement();

    // Create a temporary canvas for cropping
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) return;

    // Set the dimensions of the temporary canvas to the crop rectangle size
    tempCanvas.width = rect.width;
    tempCanvas.height = rect.height;

    // Calculate the position of the crop rectangle relative to the image
    const activeImageLeft = activeImage.left || 0;
    const activeImageTop = activeImage.top || 0;
    const activeImageScaleX = activeImage.scaleX || 1;
    const activeImageScaleY = activeImage.scaleY || 1;

    // Get crop coordinates in the image's coordinate system
    const cropX = (rect.left - activeImageLeft) / activeImageScaleX;
    const cropY = (rect.top - activeImageTop) / activeImageScaleY;
    const cropWidth = rect.width / activeImageScaleX;
    const cropHeight = rect.height / activeImageScaleY;

    // Draw the cropped portion onto the temporary canvas
    tempCtx.drawImage(
      imgElement,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      rect.width,
      rect.height
    );

    // Create a new fabric Image from the cropped canvas
    fabric.Image.fromURL(tempCanvas.toDataURL(), (croppedImg) => {
      // Remove the original image and crop rectangle
      canvas.remove(activeImage);
      canvas.remove(cropRect);

      // Position the new cropped image
      croppedImg.set({
        left: rect.left,
        top: rect.top,
      });

      // Add the cropped image to the canvas
      canvas.add(croppedImg);
      canvas.setActiveObject(croppedImg);

      // Reset the crop state
      setCropRect(null);
      setCropMode(false);
      saveCanvasState();
    });
  };

  // Sticker panel: Add sticker
  const addSticker = (emoji) => {
    if (!canvas) return;

    const text = new fabric.Text(emoji, {
      left: 100,
      top: 100,
      fontSize: 60,
      fill: "#000000",
      fontFamily:
        "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, EmojiSymbols, EmojiOne Mozilla, Twemoji Mozilla, Segoe UI Symbol",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    saveCanvasState();
  };

  // Annotation: Handle tool select
  const handleAnnotationToolSelect = (toolId) => {
    setAnnotationTool(toolId);
  };

  // Annotation: Handle color change
  const handleColorChange = (color) => {
    setLineColor(color);

    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = color;
    }

    const activeObject = canvas && canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === "i-text") {
        activeObject.set("fill", color);
      } else {
        activeObject.set("stroke", color);
      }
      canvas.renderAll();
      saveCanvasState();
    }
  };

  // Annotation: Handle line width change
  const handleLineWidthChange = (width) => {
    setLineWidth(width);

    const widthValue = lineWidths.find((w) => w.id === width)?.value || 2;

    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = widthValue;
    }

    const activeObject = canvas && canvas.getActiveObject();
    if (activeObject && activeObject.type !== "i-text") {
      activeObject.set("strokeWidth", widthValue);
      canvas.renderAll();
      saveCanvasState();
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.ctrlKey && e.key === "y") ||
        (e.ctrlKey && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        redo();
      }

      // Delete selected object: Delete or Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && canvas) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject !== activeImage) {
          canvas.remove(activeObject);
          saveCanvasState();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, undo, redo, saveCanvasState, activeImage]);

  // Render specific panel based on active tool
  const renderActivePanel = () => {
    if (!expandedPanel || !canvas) return null;

    switch (expandedPanel) {
      case "filter":
        return (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up"></div>
        );
      case "crop":
        return (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up">
            <div className="flex justify-center items-center mb-4">
              <button
                className="flex items-center justify-center gap-2 mx-2 px-4 py-1 rounded-md bg-editor-button text-white"
                onClick={handleRotateLeft}
              >
                <RotateCcw size={16} />
                Rotate left
              </button>

              <button
                className="flex items-center justify-center gap-2 mx-2 px-4 py-1 rounded-md bg-editor-button text-white"
                onClick={handleFlipHorizontal}
              >
                <FlipHorizontal size={16} />
                Flip horizontal
              </button>

              <button
                className="flex items-center justify-center gap-2 mx-2 px-4 py-1 rounded-md bg-editor-button text-white"
                onClick={() => setCropMode(!cropMode)}
              >
                <Crop size={16} />
                {cropMode ? "Cancel Crop" : "Crop shape"}
              </button>
            </div>

            {cropMode && (
              <div className="flex justify-center mb-4">
                <button
                  className="bg-editor-accent text-editor-dark font-medium px-4 py-1 rounded-lg"
                  onClick={handleApplyCrop}
                >
                  Apply Crop
                </button>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                className={`px-6 py-2 rounded-lg ${
                  activeTab === "rotation"
                    ? "bg-editor-button"
                    : "text-white/60"
                }`}
                onClick={() => setActiveTab("rotation")}
              >
                Rotation
              </button>

              <button
                className={`px-6 py-2 rounded-lg ${
                  activeTab === "scale" ? "bg-editor-button" : "text-white/60"
                }`}
                onClick={() => setActiveTab("scale")}
              >
                Scale
              </button>
            </div>

            <div className="mt-4 px-8">
              <div className="relative w-full h-1 bg-white/20 rounded-full">
                <div className="w-1 h-3 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                <div className="flex justify-between text-white/60 text-xs mt-2">
                  <span>-90°</span>
                  <span>-45°</span>
                  <span>0°</span>
                  <span>45°</span>
                  <span>90°</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "sticker":
        return (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up"></div>
        );
      case "annotate":
        return (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-editor-darker animate-slide-up"></div>
        );
      default:
        return null;
    }
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-20 bg-editor-sidebar border-r border-white/10 flex flex-col items-center py-4 overflow-y-auto">
      <button className="sidebar-tool mb-2" onClick={undo}>
        <RotateCcw className="sidebar-icon" />
        <span>Undo</span>
      </button>

      <button className="sidebar-tool mb-2" onClick={redo}>
        <Redo className="sidebar-icon" />
        <span>Redo</span>
      </button>

      <div className="w-10 h-px bg-white/10 my-2"></div>

      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`sidebar-tool ${activeTool === tool.id ? "active" : ""}`}
          onClick={() => handleToolSelect(tool.id)}
        >
          {tool.icon}
          <span>{tool.name}</span>
        </button>
      ))}
    </div>
  );

  // EditorToolbar Component
  const EditorToolbar = () => (
    <div className="p-3 flex justify-center">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-4">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={undo}
          >
            <RotateCcw size={18} className="text-white/70" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={redo}
          >
            <Redo size={18} className="text-white/70" />
          </button>
        </div>

        <div className="zoom-controls">
          <button
            className="hover:bg-white/10 p-1 rounded-full transition-colors"
            onClick={handleZoomOut}
          >
            <Minus size={16} className="text-white/70" />
          </button>

          <span className="text-sm text-white/70 w-12 text-center">
            {zoom}%
          </span>

          <button
            className="hover:bg-white/10 p-1 rounded-full transition-colors"
            onClick={handleZoomIn}
          >
            <Plus size={16} className="text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );

  // CanvasArea Component
  const CanvasArea = () => (
    <div className="flex-1 overflow-hidden flex justify-center items-center p-4 relative">
      {loading && (
        <div className="absolute inset-0 bg-editor-dark/50 flex items-center justify-center z-10">
          <div className="w-10 h-10 border-4 border-editor-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className=" animate-fade-in">
        <canvas ref={canvasRef} className="fabric-canvas shadow-lg" />
      </div>

      {!loading && !canvasRef.current && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
          <p className="text-lg mb-3">No image loaded</p>
          <p className="text-sm">Upload an image to get started</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen overflow-hidden bg-editor-dark flex flex-col">
      <div className="px-4 py-3 flex justify-between items-center border-b border-white/10">
        <h1 className="text-white font-medium text-xl">Flux Editor</h1>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <div className="flex gap-3">
          <label htmlFor="image-upload" className="tool-btn">
            Upload Image
          </label>
          <button className="tool-btn" onClick={handleSaveImage}>
            Done
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar />
          {/* <CanvasArea /> */}
          <div className="flex-1 overflow-hidden flex justify-center items-center p-4 relative">
            {loading && (
              <div className="absolute inset-0 bg-editor-dark/50 flex items-center justify-center z-10">
                <div className="w-10 h-10 border-4 border-editor-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className=" animate-fade-in">
              <canvas ref={canvasRef} className=" shadow-lg" />
            </div>

            {!loading && !canvasRef.current && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                <p className="text-lg mb-3">No image loaded</p>
                <p className="text-sm">Upload an image to get started</p>
              </div>
            )}
          </div>
          {renderActivePanel()}
        </div>
      </div>
    </div>
  );
};

export default Data;
