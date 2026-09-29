// NeuroReadControls.jsx
// "Make Reading Comfortable" — warm, friendly reading comfort controls for children & teens.

import { motion } from "framer-motion";

export const READ_FONTS = [
  { id: "nunito", label: "Friendly Rounded", family: '"Nunito", sans-serif' },
  { id: "fredoka", label: "Playful Big", family: '"Fredoka", sans-serif' },
  {
    id: "accessible",
    label: "Super Clear",
    family: '"Comic Sans MS", "Trebuchet MS", "Lexend", sans-serif',
  },
  { id: "inter", label: "Standard Book", family: '"Inter", sans-serif' },
  { id: "mono", label: "Clean Spaced", family: '"JetBrains Mono", monospace' },
];

export const CONTRAST_THEMES = [
  { id: "default", label: "Warm Paper", bg: "#FFFFFF", text: "#263238", border: "#E8DEFF" },
  { id: "soft-mint", label: "Soft Mint", bg: "#DFF7F0", text: "#123024", border: "#BAEFE2" },
  { id: "soft-yellow", label: "Sunny Amber", bg: "#FFF3D6", text: "#3D2E05", border: "#FFE099" },
  { id: "soft-sky", label: "Gentle Blue", bg: "#DCEBFF", text: "#1A365D", border: "#BEDBFF" },
  { id: "calm-dark", label: "Cozy Night", bg: "#1E293B", text: "#F8FAFC", border: "#334155" },
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#FFF3D6] border border-[#E8DEFF] text-xs font-bold text-[#546E7A] hover:text-[#263238] transition-all shadow-sm"
        >
          <span>📖</span>
          <span>Make Reading Comfortable</span>
          <span className="text-[10px] text-[#6C63FF]">{isOpen ? "▲ Close" : "▼ Options"}</span>
        </button>

        {isOpen && (
          <span className="text-xs font-semibold text-[#546E7A] hidden sm:inline">
            Pick text size, spacing, and soothing colors!
          </span>
        )}
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-6 rounded-3xl bg-white border-2 border-[#E8DEFF] shadow-card space-y-4"
        >
          {/* Text Size */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold font-sans uppercase text-[#546E7A]">
              Text Size
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "normal", label: "A Regular" },
                { id: "large", label: "A Large" },
                { id: "xl", label: "A Extra Big" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => update("fontSize", s.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    settings.fontSize === s.id
                      ? "bg-[#6C63FF] text-white border-[#534BD6] shadow-sm"
                      : "bg-[#FFF9F0] border-[#E8DEFF] text-[#263238] hover:bg-[#FFF3D6]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold font-sans uppercase text-[#546E7A]">
              Line Space
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "normal", label: "Standard" },
                { id: "relaxed", label: "Roomy" },
                { id: "spacious", label: "Extra Space" },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => update("lineHeight", l.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    settings.lineHeight === l.id
                      ? "bg-[#6C63FF] text-white border-[#534BD6] shadow-sm"
                      : "bg-[#FFF9F0] border-[#E8DEFF] text-[#263238] hover:bg-[#FFF3D6]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold font-sans uppercase text-[#546E7A]">
              Letter Spacing
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "normal", label: "Standard" },
                { id: "wide", label: "Wider Letters" },
                { id: "extrawide", label: "Super Spaced" },
              ].map((ls) => (
                <button
                  key={ls.id}
                  onClick={() => update("letterSpacing", ls.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    settings.letterSpacing === ls.id
                      ? "bg-[#6C63FF] text-white border-[#534BD6] shadow-sm"
                      : "bg-[#FFF9F0] border-[#E8DEFF] text-[#263238] hover:bg-[#FFF3D6]"
                  }`}
                >
                  {ls.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Choice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold font-sans uppercase text-[#546E7A]">
              Font Style
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {READ_FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => update("fontFamily", f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    settings.fontFamily === f.id
                      ? "bg-[#6C63FF] text-white border-[#534BD6] shadow-sm"
                      : "bg-[#FFF9F0] border-[#E8DEFF] text-[#263238] hover:bg-[#FFF3D6]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Paper Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold font-sans uppercase text-[#546E7A]">
              Paper Color
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CONTRAST_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => update("contrastTheme", t.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    settings.contrastTheme === t.id
                      ? "ring-2 ring-[#6C63FF] shadow-sm"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: t.bg, color: t.text, borderColor: t.border }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Ruler Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E8DEFF]">
            <span className="text-xs font-bold font-sans uppercase text-[#546E7A]">
              Focus Guide
            </span>
            <button
              onClick={() => update("readingRuler", !settings.readingRuler)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                settings.readingRuler
                  ? "bg-[#2EC4B6] text-white border-[#20A396] shadow-sm"
                  : "bg-[#FFF9F0] border-[#E8DEFF] text-[#263238] hover:bg-[#FFF3D6]"
              }`}
            >
              <span>📏</span>
              <span>Reading Ruler Line {settings.readingRuler ? "(ON)" : "(OFF)"}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
