// Whiteboard.jsx
// Smart RiffBoard: Friendly digital notebook for drawing ideas, shapes, arrows, and concept sketches.

import { useRef, useState, useEffect, useCallback } from "react";

const PALETTE = [
  "#263238", // Slate Pencil
  "#6C63FF", // Riff Purple
  "#3A86FF", // Sky Blue
  "#2EC4B6", // Mint
  "#FFB84D", // Warm Orange
  "#FF5E7E", // Coral
  "#9C27B0", // Berry
  "#FFFFFF", // White Chalk
];

const STROKE_SIZES = [3, 6, 10, 18];

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
  const [color, setColor] = useState("#6C63FF");
  const [lineWidth, setLineWidth] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState(null);
  const [labels, setLabels] = useState([]);

  // Undo/redo history
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const startPos = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null);

  // Initialize warm notebook canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clean warm notebook background
    ctx.fillStyle = "#FFFFFF";
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
    ctx.fillStyle = "#FFFFFF";
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
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
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
    const headlen = 16;
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
    ctx.font = "bold 18px Nunito, sans-serif";
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
    <div className="w-full p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#6C63FF] px-3 py-1 rounded-full bg-[#E8DEFF]">
            🎨 DIGITAL NOTEBOOK
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#263238] mt-2">
            Draw it out
          </h3>
          <p className="text-[#546E7A] text-xs sm:text-sm mt-1">
            Sometimes pictures make things click! Sketch the idea or let Riff draw it for you.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onVisualizeConcept}
            disabled={isVisualizing}
            className="px-5 py-2.5 rounded-full bg-[#6C63FF] hover:bg-[#534BD6] text-white text-xs font-bold transition-all shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-40"
          >
            {isVisualizing ? "Drawing..." : "✨ Draw this for me"}
          </button>
          <button
            onClick={handleAskRiffDrawing}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-[#FFF3D6] border-2 border-[#E8DEFF] text-[#263238] text-xs font-bold transition-all shadow-sm"
          >
            💡 Ask Riff About My Drawing
          </button>
        </div>
      </div>

      {/* Rounded Friendly Toolbar */}
      <div className="p-3 rounded-3xl bg-[#FFF9F0] border-2 border-[#E8DEFF] flex flex-wrap items-center justify-between gap-3">
        {/* Tool Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "brush", label: "✏️ Pencil" },
            { id: "arrow", label: "➡️ Arrow" },
            { id: "line", label: "📏 Line" },
            { id: "rect", label: "◻️ Box" },
            { id: "circle", label: "⭕ Circle" },
            { id: "text", label: "🔤 Word" },
            { id: "eraser", label: "🧹 Eraser" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                tool === t.id
                  ? "bg-[#6C63FF] text-white shadow-sm"
                  : "bg-white text-[#263238] border border-[#E8DEFF] hover:bg-[#FFF3D6]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Color Palette Dots */}
        <div className="flex items-center gap-1.5">
          {PALETTE.map((p) => (
            <button
              key={p}
              onClick={() => setColor(p)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                color === p ? "ring-2 ring-[#6C63FF] scale-110" : "border-white opacity-80 hover:opacity-100"
              }`}
              style={{ backgroundColor: p }}
              aria-label={`Color ${p}`}
            />
          ))}
        </div>

        {/* Stroke Sizes & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E8DEFF]">
            {STROKE_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setLineWidth(size)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  lineWidth === size ? "bg-[#E8DEFF]" : "hover:bg-[#FFF9F0]"
                }`}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: `${size * 0.8 + 2}px`,
                    height: `${size * 0.8 + 2}px`,
                    backgroundColor: color,
                  }}
                />
              </button>
            ))}
          </div>

          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="p-2 rounded-2xl bg-white hover:bg-[#FFF3D6] border border-[#E8DEFF] text-xs font-bold disabled:opacity-30 text-[#263238]"
            title="Undo"
          >
            ↩️
          </button>
          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="p-2 rounded-2xl bg-white hover:bg-[#FFF3D6] border border-[#E8DEFF] text-xs font-bold disabled:opacity-30 text-[#263238]"
            title="Redo"
          >
            ↪️
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-2xl bg-[#FFE0E5] hover:bg-[#FFCCD5] border border-[#FF5E7E]/30 text-[#FF5E7E] text-xs font-bold"
            title="Clear board"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-[28px] overflow-hidden border-2 border-[#E8DEFF] bg-white shadow-inner">
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
            className="absolute p-2.5 bg-white border-2 border-[#6C63FF] rounded-2xl shadow-xl flex gap-2 z-20"
            style={{ left: `${(textPos.x / 900) * 100}%`, top: `${(textPos.y / 450) * 100}%` }}
          >
            <input
              type="text"
              placeholder="Type word..."
              value={textInput}
              autoFocus
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyText()}
              className="px-3 py-1 bg-[#FFF9F0] border border-[#E8DEFF] rounded-xl text-xs text-[#263238] font-bold focus:outline-none focus:border-[#6C63FF]"
            />
            <button
              onClick={handleApplyText}
              className="px-3 py-1 rounded-xl bg-[#6C63FF] text-white text-xs font-bold"
            >
              Add
            </button>
            <button
              onClick={() => setTextPos(null)}
              className="px-2 py-1 text-[#546E7A] hover:text-[#263238] text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {visualFeedback && (
        <div className="p-4 rounded-3xl bg-[#E8DEFF]/60 border border-[#6C63FF]/30 text-xs text-[#263238] font-medium leading-relaxed">
          <strong className="block text-[#534BD6] font-display text-sm mb-1">💡 Riff's Drawing Note:</strong>
          {visualFeedback}
        </div>
      )}
    </div>
  );
}
