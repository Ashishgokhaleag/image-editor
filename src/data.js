import { useState, useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import { lineWidths } from "./constant";
import EditorToolbar from "./components/EditorToolbar";
import Sidebar from "./components/Sidebar";
import ActivePanel from "./components/ActivePanel";

const Data = () => {
  // Main canvas state
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [activeTool, setActiveTool] = useState("");
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [resolution, setResolution] = useState("standard"); // 'standard' or 'hd'
  const resolutions = {
    standard: { width: 1280, height: 720 },
    hd: { width: 1920, height: 1080 },
  };

  // Filter panel state
  const [activeFilter, setActiveFilter] = useState("default");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  // Crop panel state
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const [angle, setAngle] = useState(0);

  // Annotate panel state
  const [annotationTool, setAnnotationTool] = useState("sharpie");
  const [lineColor, setLineColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState("small");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null); // Store original image data

  const [isShapeFilled, setIsShapeFilled] = useState(true);
  const [shapeFill, setShapeFill] = useState("#000000");
  const [activeFrame, setActiveFrame] = useState("None");
  // Add new state for masking
  const [maskingMode, setMaskingMode] = useState(false);

  // Initialize canvas only once when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      const { width, height } = resolutions[resolution];
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#333",
      });
      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []); // Only run once on mount

  // Update canvas dimensions when resolution changes
  useEffect(() => {
    if (canvas) {
      const { width, height } = resolutions[resolution];
      canvas.setWidth(width);
      canvas.setHeight(height);
     canvas.renderAll();
    }
  }, [resolution, canvas]);

  useEffect(() => {
    if (expandedPanel === "annotate") {
      setAnnotationTool("sharpie");
    } else {
      setAnnotationTool("");
    }
  }, [expandedPanel]);

  // Save canvas state to history
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

  const loadCanvasState = useCallback(
    (index) => {
      if (!canvas || !history[index]) return;

      canvas.loadFromJSON(JSON.parse(history[index]), () => {
        canvas.renderAll();
        setHistoryIndex(index);

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

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !canvas) return;

    setImageFile(file);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      // Store the original image data for resolution changes
      setOriginalImageData(e.target.result);

      fabric.Image.fromURL(
        e.target.result,
        (img) => {
          // Clear the canvas of any existing content
          canvas.clear();

          // Store the original image object for later use
          setImageObj(img);

          // Set canvas dimensions based on selected resolution
          const { width, height } = resolutions[resolution];

          // Scale and position the image on the canvas
          const scaleFactor = Math.min(width / img.width, height / img.height);
          img.scale(scaleFactor);

          // Center the image
          img.set({
            left: (width - img.width * scaleFactor) / 2,
            top: (height - img.height * scaleFactor) / 2,
            selectable: false,
          });

          canvas.add(img);
          canvas.sendToBack(img);

          // Update UI state
          setLoading(false);
          setActiveFilter("default");
          setActiveFrame("None");

          // Save the initial state to history
          saveCanvasState();
        },
        { crossOrigin: "anonymous" }
      );
    };
    reader.readAsDataURL(file);
  };

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

  // Handle tool selection
  const handleToolSelect = (tool) => {
    if (tool === activeTool) {
      setActiveTool("");
      setExpandedPanel(null);
      setMaskingMode(false);
    } else {
      setActiveTool(tool);
      setExpandedPanel(tool);
      setMaskingMode(tool === "masking");
    }
  };

  // Tool code after solving infinite text renders
  useEffect(() => {
    if (!canvas) return;

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

      // Implement eraser functionality
      if (annotationTool === "eraser") {
        canvas.isDrawingMode = false;

        canvas.on("mouse:down", (e) => {
          const target = canvas.findTarget(e);
          if (target && target.isType("path")) {
            canvas.remove(target);
          }
        });
      }
      // Implement text tool functionality
      if (annotationTool === "text") {
        canvas.isDrawingMode = false;

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
        setAnnotationTool(null);
      }

      // Enable text editing on double-click
      canvas.on("mouse:dblclick", (e) => {
        const target = canvas.findTarget(e);
        if (target && target.isType("i-text")) {
          target.enterEditing();
          target.selectAll();
        }
      });
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
          fill: "red",
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
          fill: "blue",
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
      case "default":
        activeImage.filters.push(
          new fabric.Image.filters.Saturation({ saturation: 0.1 }),
          new fabric.Image.filters.Contrast({ contrast: 0.1 })
        );
        break;
      case "chrome":
        activeImage.filters.push(
          new fabric.Image.filters.Contrast({ contrast: 0.1 }),
          new fabric.Image.filters.Saturation({ saturation: 0.3 })
        );
        break;
      case "fade":
        activeImage.filters.push(
          new fabric.Image.filters.Contrast({ contrast: -0.15 }),
          new fabric.Image.filters.Saturation({ saturation: -0.2 }),
          new fabric.Image.filters.Brightness({ brightness: 0.05 })
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
      case "vintage":
        activeImage.filters.push(
          new fabric.Image.filters.Saturation({ saturation: -0.5 }),
          new fabric.Image.filters.Sepia(),
          new fabric.Image.filters.Brightness({ brightness: 0.05 })
        );
        break;
      case "sepia":
        activeImage.filters.push(new fabric.Image.filters.Sepia());
        break;
      case "invert":
        activeImage.filters.push(new fabric.Image.filters.Invert());
        break;
      case "brightnessBoost":
        activeImage.filters.push(
          new fabric.Image.filters.Brightness({ brightness: 0.3 })
        );
        break;
      case "contrastBoost":
        activeImage.filters.push(
          new fabric.Image.filters.Contrast({ contrast: 0.4 })
        );
        break;
      default:
        // No filter for default
        break;
    }

    activeImage.applyFilters();
    canvas.renderAll();
    saveCanvasState();
  };

  // Filter panel: Handle adjustment change
  const handleAdjustmentChange = (adjustment, value) => {
    adjustment.setValue(value);
    applyAdjustments();
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

  // handleApplyCrop
  const handleApplyCrop = () => {
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

    // Save the cropped image as the new original image data
    setOriginalImageData(croppedDataUrl);

    fabric.Image.fromURL(croppedDataUrl, (croppedImg) => {
      croppedImg.set({
        left: 50,
        top: 50,
        selectable: false,
        hasBorders: false,
        hasControls: false,
      });

      croppedImg.scaleToWidth(canvas.width * 1);
      croppedImg.scaleToHeight(canvas.height * 1);

      canvas.clear();
      canvas.add(croppedImg);
      canvas.sendToBack(croppedImg);
      setImageObj(croppedImg);
    });

    setCropRect(null);
    setCropMode(false);
    saveCanvasState();
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

  const clearMasking = () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ fill: null });

      activeObject.set({ opacity: 1 });
      canvas.renderAll();
    }
  };

  const applyFrame = (frameType) => {
    if (!activeImage || !canvas) return;

    // Clear existing frames
    setActiveFrame(frameType);
    canvas.getObjects("rect").forEach((obj) => {
      if (obj.frame) canvas.remove(obj);
    });

    if (frameType === "None") return;

    const frameStyles = {
      Mat: { stroke: "gray", strokeWidth: 5 },
      Bevel: { stroke: "lightgray", strokeWidth: 8 },
      Line: { stroke: "black", strokeWidth: 2 },
      Zebra: { stroke: "black", strokeWidth: 10, strokeDashArray: [5, 5] },
      Lumber: { stroke: "brown", strokeWidth: 12 },
      Inset: { stroke: "darkgray", strokeWidth: 6 },
      Plus: { stroke: "black", strokeWidth: 4, strokeDashArray: [10, 5] },
      Hook: { stroke: "black", strokeWidth: 3, strokeDashArray: [15, 5] },
      Polaroid: { stroke: "white", strokeWidth: 15 },
    };

    const frameStyle = frameStyles[frameType] || {
      stroke: "white",
      strokeWidth: 10,
    };

    const frame = new fabric.Rect({
      left: activeImage.left,
      top: activeImage.top,
      width: activeImage.width * activeImage.scaleX,
      height: activeImage.height * activeImage.scaleY,
      fill: "transparent",
      ...frameStyle,
      selectable: false,
      frame: true,
    });

    canvas.add(frame);
    canvas.renderAll();
    saveCanvasState();
  };

  const addShapes = (name) => {
    if (!canvas) return;

    switch (name) {
      case "Rectangle":
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
        break;
      case "Ellipse":
        const circle = new fabric.Circle({
          left: 200,
          top: 200,
          radius: 50,
          fill: isShapeFilled ? shapeFill : "transparent",
          stroke: "black",
          strokeWidth: 2,
        });
        canvas.add(circle);
        break;
      default:
        console.log("Shape not recognized.");
    }
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

  // Handle adjustments
  const applyAdjustments = () => {
    if (!activeImage) return;

    activeImage.filters = activeImage.filters || [];

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
        if (activeObject) {
          if (activeObject.type === "i-text" && activeObject.isEditing) {
            return;
          } else if (activeObject !== activeImage) {
            canvas.remove(activeObject);
            saveCanvasState();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, undo, redo, saveCanvasState, activeImage]);

  const removeMask = () => {
    if (!canvas || !activeImage) return;

    const maskObject = canvas
      .getObjects()
      .find((obj) => obj.clipPath === activeImage);
    if (maskObject) {
      canvas.remove(maskObject);
      canvas.renderAll();
      saveCanvasState();
    }
  };

  const adjustMaskPosition = (maskObj) => {
    if (!activeImage) return;

    // Ensure mask stays aligned with base image
    const baseLeft = activeImage.left;
    const baseTop = activeImage.top;

    maskObj.set({
      left: baseLeft,
      top: baseTop,
    });
  };

  const changeResolution = (res) => {
    if (!canvas) return;

    setResolution(res);

    // If we have an image loaded, we need to reload and rescale it
    if (originalImageData && canvas) {
      setLoading(true);

      fabric.Image.fromURL(
        originalImageData,
        (img) => {
          // Clear the canvas
          canvas.clear();

          // Store the image object
          setImageObj(img);

          // Get new dimensions
          const { width, height } = resolutions[res];

          // Scale image to fit the new canvas size
          const scaleFactor = Math.min(width / img.width, height / img.height);
          img.scale(scaleFactor);

          // Center the image
          img.set({
            left: (width - img.width * scaleFactor) / 2,
            top: (height - img.height * scaleFactor) / 2,
            selectable: false,
          });

          // Add the image to canvas
          canvas.add(img);
          canvas.sendToBack(img);

          // Set the active image
          setActiveImage(img);
          setLoading(false);

          // Restore any filters or adjustments
          if (activeFilter !== "default") {
            applyFilter(activeFilter);
          }

          // Save the new state
          saveCanvasState();
        },
        { crossOrigin: "anonymous" }
      );
    }
  };

  // Add to your useEffect for canvas events
  useEffect(() => {
    if (!canvas) return;

    const handleObjectMoving = (e) => {
      const obj = e.target;
      if (obj.clipPath === activeImage) {
        adjustMaskPosition(obj);
      }
    };

    canvas.on("object:moving", handleObjectMoving);

    return () => {
      canvas.off("object:moving", handleObjectMoving);
    };
  }, [canvas, activeImage]);

  const setupMaskingInteractions = useCallback(() => {
    if (!canvas) return;

    const handleMaskScaling = (e) => {
      const obj = e.target;
      if (obj && obj.type === "image" && obj !== activeImage) {
        // Ensure minimum size
        const minScale = 0.1;
        obj.scaleX = Math.max(obj.scaleX, minScale);
        obj.scaleY = Math.max(obj.scaleY, minScale);
      }
    };

    const handleMaskMoving = (e) => {
      const obj = e.target;
      if (obj && obj.type === "image" && obj !== activeImage) {
        // Keep mask within canvas bounds
        const bound = obj.getBoundingRect();
        if (bound.left < 0) {
          obj.left = obj.left - bound.left;
        }
        if (bound.top < 0) {
          obj.top = obj.top - bound.top;
        }
        if (bound.left + bound.width > canvas.width) {
          obj.left = canvas.width - bound.width;
        }
        if (bound.top + bound.height > canvas.height) {
          obj.top = canvas.height - bound.height;
        }
      }
    };

    canvas.on("object:scaling", handleMaskScaling);
    canvas.on("object:moving", handleMaskMoving);
    canvas.on("object:modified", saveCanvasState);

    return () => {
      canvas.off("object:scaling", handleMaskScaling);
      canvas.off("object:moving", handleMaskMoving);
      canvas.off("object:modified", saveCanvasState);
    };
  }, [canvas, activeImage, saveCanvasState]);

  // Add this useEffect to handle masking interactions
  useEffect(() => {
    if (maskingMode) {
      const cleanup = setupMaskingInteractions();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [maskingMode, setupMaskingInteractions]);


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
          <div className="flex items-center justify-center space-x-4">
            <select
              id="resolution"
              className="block w-48 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none bg-white text-gray-700 text-sm"
              value={resolution}
              onChange={(e) => changeResolution(e.target.value)}
            >
              <option value="standard">Standard (1280x720)</option>
              <option value="hd">HD (1920x1080)</option>
            </select>
          </div>

          <label htmlFor="image-upload" className="tool-btn">
            Upload Image
          </label>
          <button className="tool-btn" onClick={handleSaveImage}>
            Done
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          undo={undo}
          redo={redo}
          activeTool={activeTool}
          handleToolSelect={handleToolSelect}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar
            undo={undo}
            redo={redo}
            handleZoomOut={handleZoomOut}
            zoom={zoom}
            handleZoomIn={handleZoomIn}
          />
          <div className="flex-1 overflow-hidden flex justify-center items-center p-4 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-10 h-10 border-4 border-editor-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="animate-fade-in">
              <canvas ref={canvasRef} className="" />
            </div>

            {!loading ||
              (!canvasRef.current && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                  <p className="text-lg mb-3">No image loaded</p>
                  <p className="text-sm">Upload an image to get started</p>
                </div>
              ))}
          </div>
          {
            <ActivePanel
              expandedPanel={expandedPanel}
              canvas={canvas}
              activeFilter={activeFilter}
              applyFilter={applyFilter}
              handleAdjustmentChange={handleAdjustmentChange}
              handleRotateLeft={handleRotateLeft}
              handleFlipHorizontal={handleFlipHorizontal}
              setCropMode={setCropMode}
              cropMode={cropMode}
              handleApplyCrop={handleApplyCrop}
              applyMask={applyMask}
              clearMasking={clearMasking}
              activeFrame={activeFrame}
              applyFrame={applyFrame}
              isShapeFilled={isShapeFilled}
              setIsShapeFilled={setIsShapeFilled}
              shapeFill={shapeFill}
              setShapeFill={setShapeFill}
              annotationTool={annotationTool}
              addShapes={addShapes}
              lineColor={lineColor}
              lineWidth={lineWidth}
              handleLineWidthChange={handleLineWidthChange}
              handleAnnotationToolSelect={handleAnnotationToolSelect}
              handleColorChange={handleColorChange}
              brightness={brightness}
              setBrightness={setBrightness}
              contrast={contrast}
              setContrast={setContrast}
              saturation={saturation}
              setSaturation={setSaturation}
              activeImage={activeImage}
              originalImageData={originalImageData}
            />
          }
          {/* {expandedPanel === "masking" && (
            <MaskingPanel canvas={canvas} activeImage={activeImage} />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Data;
