// NeuroReadControls.jsx
// Accessibility & Neuro-Read Controls:
// Custom typography, line/letter spacing, high-contrast themes, focus ruler,
// and synchronized speech highlighting in dark frosted-glass aesthetic.

import { motion } from "framer-motion";

export const READ_FONTS = [
  { id: "inter", label: "Inter", family: '"Inter", sans-serif' },
  {
    id: "accessible",
    label: "Accessible Sans",
    family: '"Comic Sans MS", "Trebuchet MS", "Lexend", sans-serif',
  },
  { id: "fraunces", label: "Fraunces Serif", family: '"Fraunces", serif' },
  { id: "playfair", label: "Playfair Display", family: '"Playfair Display", serif' },
  { id: "mono", label: "JetBrains Mono", family: '"JetBrains Mono", monospace' },
];

export const CONTRAST_THEMES = [
  { id: "default", label: "Dark Cinematic", bg: "rgba(255,255,255,0.03)", text: "#f8fafc", border: "rgba(255,255,255,0.1)" },
  { id: "warm", label: "Warm Sepia", bg: "#1f1a14", text: "#fef3c7", border: "#78350f" },
  { id: "midnight", label: "Emerald Contrast", bg: "#061a14", text: "#ecfdf5", border: "#047857" },
  { id: "high-dark", label: "OLED High Contrast", bg: "#000000", text: "#ffffff", border: "#ffffff" },
];

export default function NeuroReadControls({
  settings,
  onChange,
  isOpen,
  onToggle,
}) {
  const update = (key, val) => {
    onChange({ ...settings, [key]: val });
  };

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all backdrop-blur-md"
        >
          <span>📖</span>
          <span>Neuro-Read Controls</span>
          <span className="text-[10px] text-white/40">{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <span className="text-[11px] text-white/40 font-mono hidden sm:inline">
            Custom typography, line/letter spacing & contrast
          </span>
        )}
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-4"
        >
          {/* Text Size */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">
              Text Size
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "normal", label: "Standard" },
                { id: "large", label: "Large" },
                { id: "xl", label: "Extra Large" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => update("fontSize", s.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    settings.fontSize === s.id
                      ? "bg-indigo-500 text-white border-indigo-400"
                      : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">
              Line Spacing
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "normal", label: "Standard" },
                { id: "relaxed", label: "Relaxed" },
                { id: "spacious", label: "Spacious" },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => update("lineHeight", l.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    settings.lineHeight === l.id
                      ? "bg-indigo-500 text-white border-indigo-400"
                      : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">
              Letter Spacing
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "normal", label: "Standard" },
                { id: "wide", label: "Wide" },
                { id: "extrawide", label: "Extra Wide" },
              ].map((ls) => (
                <button
                  key={ls.id}
                  onClick={() => update("letterSpacing", ls.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    settings.letterSpacing === ls.id
                      ? "bg-indigo-500 text-white border-indigo-400"
                      : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {ls.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">
              Font Family
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {READ_FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => update("fontFamily", f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    settings.fontFamily === f.id
                      ? "bg-indigo-500 text-white border-indigo-400"
                      : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">
              Contrast Theme
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CONTRAST_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => update("contrastTheme", t.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    settings.contrastTheme === t.id
                      ? "border-indigo-400 ring-2 ring-indigo-500/40"
                      : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: t.bg, color: t.text }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Tools */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/[0.08]">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">
              Reading Tools
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update("readingRuler", !settings.readingRuler)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  settings.readingRuler
                    ? "bg-indigo-500 text-white border-indigo-400"
                    : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <span>📏</span>
                <span>Reading Ruler {settings.readingRuler ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
