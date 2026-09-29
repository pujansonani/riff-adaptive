// Whiteboard.jsx
// RiffBoard: Interactive multimodal canvas for sketching, concept diagrams,
// and visual reasoning. No paid external libraries required.

import { useRef, useState, useEffect, useCallback } from "react";

const PALETTE = [
  "#16261f", // Ink
  "#2d6e5e", // Riff Teal
  "#ff6b4a", // Coral
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ef4444", // Red
];

const STROKE_SIZES = [2, 4, 8, 14];

export default function Whiteboard({
  concept = "",
  interest = "",
  onAskRiff,
  onVisualizeConcept,
  isVisualizing = false,
  visualFeedback = "",
}) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("brush"); // brush | line | arrow | rect | circle | text | eraser
  const [color, setColor] = useState("#2d6e5e");
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState(null);
  const [labels, setLabels] = useState([]);

  // Undo/redo history
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const startPos = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Set background to clean white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Initial snapshot
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
    setHistoryStep(0);
  }, []);

  const saveHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(0, historyStep + 1), data]);
    setHistoryStep((prev) => prev + 1);
  }, [historyStep]);

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const prevData = history[historyStep - 1];
    ctx.putImageData(prevData, 0, 0);
    setHistoryStep((prev) => prev - 1);
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const nextData = history[historyStep + 1];
    ctx.putImageData(nextData, 0, 0);
    setHistoryStep((prev) => prev + 1);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setLabels([]);
    saveHistoryState();
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (tool === "text") {
      setTextPos(coords);
      return;
    }

    setIsDrawing(true);
    startPos.current = coords;
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 3 : lineWidth;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (tool === "brush" || tool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      // Shapes: restore snapshot to preview dynamically
      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
      }
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === "line") {
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === "arrow") {
        drawArrow(ctx, startPos.current.x, startPos.current.y, coords.x, coords.y);
      } else if (tool === "rect") {
        const w = coords.x - startPos.current.x;
        const h = coords.y - startPos.current.y;
        ctx.strokeRect(startPos.current.x, startPos.current.y, w, h);
      } else if (tool === "circle") {
        const radius = Math.sqrt(
          (coords.x - startPos.current.x) ** 2 + (coords.y - startPos.current.y) ** 2
        );
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headlen = 14;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  const handleApplyText = () => {
    if (!textInput.trim() || !textPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(textInput.trim(), textPos.x, textPos.y);

    setLabels((prev) => [...prev, { text: textInput.trim(), x: textPos.x, y: textPos.y }]);
    setTextInput("");
    setTextPos(null);
    saveHistoryState();
  };

  // Draw structured visual diagram
  const renderDiagramElements = (elements) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach((el) => {
      ctx.strokeStyle = el.color || "#2d6e5e";
      ctx.fillStyle = el.color || "#2d6e5e";
      ctx.lineWidth = 3;

      if (el.type === "node" || el.type === "rect") {
        // Draw card/box
        ctx.fillStyle = "#f3f8f4";
        ctx.fillRect(el.x, el.y, el.width || 140, el.height || 60);
        ctx.strokeRect(el.x, el.y, el.width || 140, el.height || 60);

        // Text
        ctx.fillStyle = "#16261f";
        ctx.font = "bold 14px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(el.text || "", el.x + (el.width || 140) / 2, el.y + (el.height || 60) / 2);
      } else if (el.type === "arrow") {
        drawArrow(ctx, el.fromX, el.fromY, el.toX, el.toY);
        if (el.label) {
          ctx.fillStyle = "#4a5c52";
          ctx.font = "12px JetBrains Mono, monospace";
          ctx.fillText(el.label, (el.fromX + el.toX) / 2, (el.fromY + el.toY) / 2 - 10);
        }
      }
    });

    saveHistoryState();
  };

  const handleAskRiffDrawing = () => {
    if (onAskRiff) {
      const drawnText = labels.map((l) => l.text).join(", ");
      onAskRiff({ labels: drawnText, toolCount: historyStep });
    }
  };

  return (
    <div className="riff-whiteboard-card">
      <div className="riff-wb-header">
        <div>
          <span className="riff-panel-label" style={{ margin: 0 }}>
            RiffBoard — Visual Canvas
          </span>
          <p className="riff-wb-subtitle">Draw diagrams, sketch concepts, or connect ideas with arrows.</p>
        </div>
        <div className="riff-wb-actions">
          <button
            className="riff-btn-small accept"
            onClick={onVisualizeConcept}
            disabled={isVisualizing}
            title="Auto-generate a concept diagram for the current lesson"
          >
            {isVisualizing ? "Visualizing..." : "✨ Visualize Concept"}
          </button>
          <button
            className="riff-btn-small ghost"
            onClick={handleAskRiffDrawing}
            title="Ask Riff to review your diagram labels"
          >
            💡 Ask Riff about this
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="riff-wb-toolbar" role="toolbar" aria-label="Whiteboard Drawing Tools">
        <div className="riff-wb-toolgroup">
          {[
            { id: "brush", label: "✏️ Pen" },
            { id: "arrow", label: "➡️ Arrow" },
            { id: "line", label: "📏 Line" },
            { id: "rect", label: "◻️ Box" },
            { id: "circle", label: "⭕ Circle" },
            { id: "text", label: "🔤 Text" },
            { id: "eraser", label: "🧹 Eraser" },
          ].map((t) => (
            <button
              key={t.id}
              className={`riff-wb-tool-btn ${tool === t.id ? "active" : ""}`}
              onClick={() => setTool(t.id)}
              aria-label={t.label}
              title={t.label}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="riff-wb-toolgroup">
          <div className="riff-wb-palette" role="group" aria-label="Color Selection">
            {PALETTE.map((p) => (
              <button
                key={p}
                className={`riff-wb-color-dot ${color === p ? "selected" : ""}`}
                style={{ backgroundColor: p }}
                onClick={() => setColor(p)}
                aria-label={`Color ${p}`}
              />
            ))}
          </div>
        </div>

        <div className="riff-wb-toolgroup">
          <div className="riff-wb-strokes" role="group" aria-label="Stroke Thickness">
            {STROKE_SIZES.map((size) => (
              <button
                key={size}
                className={`riff-wb-size-btn ${lineWidth === size ? "active" : ""}`}
                onClick={() => setLineWidth(size)}
                aria-label={`Thickness ${size}px`}
              >
                <span
                  style={{
                    width: `${size * 1.5 + 4}px`,
                    height: `${size * 1.5 + 4}px`,
                    borderRadius: "50%",
                    background: color,
                    display: "inline-block",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="riff-wb-toolgroup right">
          <button
            className="riff-wb-tool-btn icon-only"
            onClick={handleUndo}
            disabled={historyStep <= 0}
            title="Undo"
            aria-label="Undo"
          >
            ↩️
          </button>
          <button
            className="riff-wb-tool-btn icon-only"
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            title="Redo"
            aria-label="Redo"
          >
            ↪️
          </button>
          <button
            className="riff-wb-tool-btn icon-only danger"
            onClick={handleClear}
            title="Clear Canvas"
            aria-label="Clear Canvas"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="riff-wb-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="riff-wb-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          aria-label="Interactive concept drawing canvas"
        />

        {textPos && (
          <div
            className="riff-wb-text-popup"
            style={{ left: `${(textPos.x / 800) * 100}%`, top: `${(textPos.y / 400) * 100}%` }}
          >
            <input
              type="text"
              placeholder="Type label..."
              value={textInput}
              autoFocus
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyText()}
            />
            <button className="riff-btn-small accept" onClick={handleApplyText}>
              Add
            </button>
            <button className="riff-btn-small dismiss" onClick={() => setTextPos(null)}>
              ✕
            </button>
          </div>
        )}
      </div>

      {visualFeedback && (
        <div className="riff-wb-feedback">
          <span className="riff-input-label">Riff's Visual Feedback</span>
          <p>{visualFeedback}</p>
        </div>
      )}
    </div>
  );
}
