// Whiteboard.jsx
// Smart RiffBoard: Interactive multimodal canvas with structured concept diagrams,
// dark glass toolbar, text labels, shape differentiation, and Socratic visual feedback.

import { useRef, useState, useEffect, useCallback } from "react";

const PALETTE = [
  "#FFFFFF", // White
  "#9F67FF", // Riff Purple
  "#47BFFF", // Riff Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#F43F5E", // Rose
  "#E2E8F0", // Slate
  "#64748B", // Muted
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
  const [color, setColor] = useState("#9F67FF");
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

  // Initialize dark canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Set dark background
    ctx.fillStyle = "#0A0710";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    ctx.fillStyle = "#0A0710";
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
    ctx.strokeStyle = tool === "eraser" ? "#0A0710" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
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
    ctx.font = "bold 16px 'Inter Tight', Inter, sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(textInput.trim(), textPos.x, textPos.y);

    setLabels((prev) => [...prev, { text: textInput.trim(), x: textPos.x, y: textPos.y }]);
    setTextInput("");
    setTextPos(null);
    saveHistoryState();
  };

  const handleAskRiffDrawing = () => {
    if (onAskRiff) {
      const drawnText = labels.map((l) => l.text).join(", ");
      onAskRiff({ labels: drawnText, toolCount: historyStep });
    }
  };

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C084FC] font-semibold px-2.5 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
            Spatial Concept Canvas
          </span>
          <h3 className="font-display text-2xl sm:text-3xl text-white font-bold mt-2">
            Smart RiffBoard Workspace
          </h3>
          <p className="text-white/50 text-xs mt-1">
            Draw relationships, annotate conceptual steps, or auto-render structural models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onVisualizeConcept}
            disabled={isVisualizing}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C084FC] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#7C3AED]/20 disabled:opacity-40"
          >
            {isVisualizing ? "Visualizing..." : "✨ Auto-Visualize Concept"}
          </button>
          <button
            onClick={handleAskRiffDrawing}
            className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-semibold transition-all backdrop-blur-md"
          >
            💡 Ask Riff About Drawing
          </button>
        </div>
      </div>

      {/* Glass Toolbar */}
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "brush", label: "✏️ Pen" },
            { id: "arrow", label: "➡️ Arrow" },
            { id: "line", label: "📏 Line" },
            { id: "rect", label: "◻️ Box" },
            { id: "circle", label: "⭕ Circle" },
            { id: "text", label: "🔤 Label" },
            { id: "eraser", label: "🧹 Eraser" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                tool === t.id
                  ? "bg-[#7C3AED] text-white border-[#9F67FF]"
                  : "bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5">
          {PALETTE.map((p) => (
            <button
              key={p}
              onClick={() => setColor(p)}
              className={`w-6 h-6 rounded-full border transition-all ${
                color === p ? "ring-2 ring-white scale-110" : "border-white/20 opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: p }}
              aria-label={`Color ${p}`}
            />
          ))}
        </div>

        {/* Stroke Sizes & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl">
            {STROKE_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setLineWidth(size)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  lineWidth === size ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: `${size * 1.5 + 2}px`,
                    height: `${size * 1.5 + 2}px`,
                    backgroundColor: color,
                  }}
                />
              </button>
            ))}
          </div>

          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs disabled:opacity-30 text-white"
            title="Undo"
          >
            ↩️
          </button>
          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs disabled:opacity-30 text-white"
            title="Redo"
          >
            ↪️
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs"
            title="Clear board"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0A0710] shadow-inner">
        <canvas
          ref={canvasRef}
          width={900}
          height={450}
          className="w-full h-auto cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        {textPos && (
          <div
            className="absolute p-2 bg-[#0D0912] border border-white/20 rounded-xl shadow-2xl flex gap-2 z-20"
            style={{ left: `${(textPos.x / 900) * 100}%`, top: `${(textPos.y / 450) * 100}%` }}
          >
            <input
              type="text"
              placeholder="Type concept label..."
              value={textInput}
              autoFocus
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyText()}
              className="px-3 py-1 bg-black/50 border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-[#C084FC]"
            />
            <button
              onClick={handleApplyText}
              className="px-3 py-1 rounded-lg bg-white text-black text-xs font-semibold"
            >
              Add
            </button>
            <button
              onClick={() => setTextPos(null)}
              className="px-2 py-1 text-white/50 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {visualFeedback && (
        <div className="p-4 rounded-2xl bg-[#7C3AED]/15 border border-[#9F67FF]/30 text-xs text-white/90">
          <strong className="block text-[#C084FC] uppercase font-mono mb-1">💡 Riff's Visual Feedback:</strong>
          {visualFeedback}
        </div>
      )}
    </div>
  );
}
