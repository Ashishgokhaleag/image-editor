import { useState, useRef, useCallback, useEffect } from "react";
import "./navbar.css";

const UIExtractor = () => {
  // Button extraction state
  const [buttonMode, setButtonMode] = useState("padding");
  const [buttonSize, setButtonSize] = useState(512);
  const [buttonPadding, setButtonPadding] = useState(0);
  const [buttonTolerance, setButtonTolerance] = useState(30);
  const [forceSquare, setForceSquare] = useState(true);
  const [buttonComponents, setButtonComponents] = useState([]);
  const [extractedButtons, setExtractedButtons] = useState([]);

  // Refs
  const buttonFileRef = useRef(null);
  const canvasRef = useRef(null);

  // Source images
  const [buttonSourceImg, setButtonSourceImg] = useState(null);

  // Utility function to mask background
  const maskBackground = useCallback((ctx, w, h, tolerance) => {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Sample corners for background color
    const corners = [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1],
    ];
    let sumR = 0,
      sumG = 0,
      sumB = 0;

    corners.forEach(([x, y]) => {
      const i = (y * w + x) * 4;
      sumR += data[i];
      sumG += data[i + 1];
      sumB += data[i + 2];
    });

    const avgR = sumR / 4;
    const avgG = sumG / 4;
    const avgB = sumB / 4;

    // Remove background pixels within tolerance
    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - avgR;
      const dg = data[i + 1] - avgG;
      const db = data[i + 2] - avgB;

      if (Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Flood fill detection for connected components
  const floodDetect = useCallback((ctx, w, h) => {
    const data = ctx.getImageData(0, 0, w, h).data;
    const visited = new Uint8Array(w * h);
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const components = [];

    const idx = (x, y) => y * w + x;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(x, y);
        if (visited[i] || data[i * 4 + 3] < 16) {
          visited[i] = 1;
          continue;
        }

        const queue = [[x, y]];
        visited[i] = 1;
        let minX = x,
          minY = y,
          maxX = x,
          maxY = y;

        for (let q = 0; q < queue.length; q++) {
          const [cx, cy] = queue[q];
          dirs.forEach(([dx, dy]) => {
            const nx = cx + dx,
              ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;

            const ni = idx(nx, ny);
            if (visited[ni]) return;
            if (data[ni * 4 + 3] < 16) {
              visited[ni] = 1;
              return;
            }

            visited[ni] = 1;
            queue.push([nx, ny]);
            minX = Math.min(minX, nx);
            minY = Math.min(minY, ny);
            maxX = Math.max(maxX, nx);
            maxY = Math.max(maxY, ny);
          });
        }

        if (maxX - minX > 4 && maxY - minY > 4) {
          components.push({ minX, minY, maxX, maxY });
        }
      }
    }

    return components;
  }, []);

  // Handle button file upload
  const handleButtonFile = useCallback(
    (file) => {
      if (!file || !file.type.includes("png")) {
        alert("Please upload a PNG file");
        return;
      }

      const img = new Image();
      img.onload = () => {
        setButtonSourceImg(img);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        maskBackground(ctx, canvas.width, canvas.height, buttonTolerance);
        const components = floodDetect(ctx, canvas.width, canvas.height);
        setButtonComponents(components);
      };
      img.src = URL.createObjectURL(file);
    },
    [buttonTolerance, maskBackground, floodDetect]
  );

  // Render extracted buttons
  useEffect(() => {
    if (!buttonSourceImg || !buttonComponents.length) {
      setExtractedButtons([]);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Redraw and mask the image
    canvas.width = buttonSourceImg.width;
    canvas.height = buttonSourceImg.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(buttonSourceImg, 0, 0);
    maskBackground(ctx, canvas.width, canvas.height, buttonTolerance);

    const extracted = [];

    buttonComponents.forEach((c, i) => {
      // Expand by padding
      const x0 = Math.max(0, c.minX - buttonPadding);
      const y0 = Math.max(0, c.minY - buttonPadding);
      const x1 = Math.min(canvas.width, c.maxX + buttonPadding);
      const y1 = Math.min(canvas.height, c.maxY + buttonPadding);
      const w0 = x1 - x0 + 1;
      const h0 = y1 - y0 + 1;

      // Determine output dimensions
      let ow = w0,
        oh = h0;
      if (buttonMode === "resize") {
        const scale = buttonSize / Math.max(w0, h0);
        ow = Math.round(w0 * scale);
        oh = Math.round(h0 * scale);
      }

      let cw, ch;
      if (buttonMode === "padding") {
        cw = ch = buttonSize;
      } else {
        if (forceSquare) {
          cw = ch = buttonSize;
        } else {
          cw = ow;
          ch = oh;
        }
      }

      const offX = Math.floor((cw - ow) / 2);
      const offY = Math.floor((ch - oh) / 2);

      // Create temporary canvas for extraction
      const tmp = document.createElement("canvas");
      tmp.width = cw;
      tmp.height = ch;
      const tctx = tmp.getContext("2d");
      if (!tctx) return;

      tctx.clearRect(0, 0, cw, ch);
      tctx.drawImage(canvas, x0, y0, w0, h0, offX, offY, ow, oh);

      const dataURL = tmp.toDataURL();
      const filename = `btn_${String(i + 1).padStart(2, "0")}.png`;

      extracted.push({ filename, dataURL, width: cw, height: ch });
    });

    setExtractedButtons(extracted);
  }, [
    buttonSourceImg,
    buttonComponents,
    buttonMode,
    buttonSize,
    buttonPadding,
    buttonTolerance,
    forceSquare,
    maskBackground,
  ]);

  // Render extracted sprites

  // Download all buttons
  const downloadAllButtons = () => {
    extractedButtons.forEach((btn) => {
      const link = document.createElement("a");
      link.href = btn.dataURL;
      link.download = btn.filename;
      link.click();
    });
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === "button") {
        handleButtonFile(file);
      }
    }
  };

  return (
    <div className="ui-extractor">
      <div className="container pt-5">
        <div className="tab-content ">
          {/* Settings Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚙️ Extraction Settings</h3>
            </div>
            <div className="card-content">
              <div className="controls-grid">
                {/* Mode Selection */}
                <div className="control-group">
                  <label className="control-label">Extraction Mode</label>
                  <div className="radio-group">
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="buttonMode"
                        value="padding"
                        checked={buttonMode === "padding"}
                        onChange={(e) => setButtonMode(e.target.value)}
                      />
                      Padding Mode
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="buttonMode"
                        value="resize"
                        checked={buttonMode === "resize"}
                        onChange={(e) => setButtonMode(e.target.value)}
                      />
                      Resize Mode
                    </label>
                  </div>
                </div>

                {/* Size Settings */}
                <div className="control-group">
                  <label className="control-label">
                    Base Size: {buttonSize}px
                  </label>
                  <input
                    type="range"
                    min="32"
                    max="1024"
                    step="32"
                    value={buttonSize}
                    onChange={(e) => setButtonSize(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                {/* Padding */}
                <div className="control-group">
                  <label className="control-label">
                    Extra Padding: {buttonPadding}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="1"
                    value={buttonPadding}
                    onChange={(e) => setButtonPadding(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                {/* Tolerance */}
                <div className="control-group">
                  <label className="control-label">
                    Background Tolerance: {buttonTolerance}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    step="1"
                    value={buttonTolerance}
                    onChange={(e) => setButtonTolerance(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>

              <div className="card-footer">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={forceSquare}
                    onChange={(e) => setForceSquare(e.target.checked)}
                  />
                  Force square output
                </label>

                <button
                  onClick={downloadAllButtons}
                  disabled={!extractedButtons.length}
                  className="btn btn-primary"
                >
                  📥 Download All ({extractedButtons.length})
                </button>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className="upload-zone"
            onClick={() => buttonFileRef.current?.click()}
            onDrop={(e) => handleDrop(e, "button")}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="upload-content">
              <div className="upload-icon">📤</div>
              <h3 className="upload-title">Drop your PNG image here</h3>
              <p className="upload-subtitle">or click to browse files</p>
              <button className="btn btn-outline">Choose File</button>
              <input
                ref={buttonFileRef}
                type="file"
                accept="image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleButtonFile(file);
                }}
                style={{ display: "none" }}
              />
            </div>
          </div>
          {buttonSourceImg && (
            <div className="image-preview mt-4 text-center">
              <h4>Uploaded Button Image Preview</h4>
              <img
                src={buttonSourceImg.src}
                alt="Uploaded Button"
                style={{
                  maxWidth: "100%",
                  maxHeight: 400,
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginTop: "1rem",
                }}
              />
            </div>
          )}

          {/* Results */}
          {extractedButtons.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  🎨 Extracted Buttons ({extractedButtons.length})
                </h3>
              </div>
              <div className="card-content">
                <div className="results-grid">
                  {extractedButtons.map((btn, i) => (
                    <div key={i} className="result-item">
                      <div className="result-image">
                        <img
                          src={btn.dataURL || "/placeholder.svg"}
                          alt={btn.filename}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = btn.dataURL;
                          link.download = btn.filename;
                          link.click();
                        }}
                        className="btn btn-small"
                      >
                        📥 {btn.filename}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default UIExtractor;
