// NeuroReadControls.jsx
// Neuro-Read / Accessible Reading Support:
// Custom typography, line/letter spacing, high-contrast themes, focus guides,
// and synchronized speech highlighting.

export const READ_FONTS = [
  { id: "inter", label: "Inter (Standard)", family: '"Inter", sans-serif' },
  {
    id: "accessible",
    label: "Accessible Sans",
    family: '"Comic Sans MS", "Trebuchet MS", "Lexend", sans-serif',
  },
  { id: "fraunces", label: "Fraunces (Serif)", family: '"Fraunces", serif' },
  { id: "mono", label: "JetBrains (Mono)", family: '"JetBrains Mono", monospace' },
];

export const CONTRAST_THEMES = [
  { id: "default", label: "Default", bg: "var(--paper-raised)", text: "var(--ink)" },
  { id: "warm", label: "Warm Paper", bg: "#fdf8ee", text: "#2c2416", border: "#e8dac0" },
  { id: "midnight", label: "Midnight High Contrast", bg: "#0d1a14", text: "#f0fdf4", border: "#2d6e5e" },
  { id: "mint", label: "Soft Mint", bg: "#effaf4", text: "#123024", border: "#c2ebd7" },
  { id: "solar", label: "Solar Amber", bg: "#fffcf0", text: "#3d2e05", border: "#fae89c" },
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
    <div className="riff-neuro-read-container">
      <div className="riff-neuro-bar">
        <button
          className={`riff-btn-small ${isOpen ? "accept" : "ghost"}`}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="neuro-read-panel"
        >
          📖 Reading Support (Neuro-Read) {isOpen ? "▲" : "▼"}
        </button>

        {isOpen && (
          <span className="riff-neuro-hint">
            Customize typography, spacing, and contrast for maximum clarity.
          </span>
        )}
      </div>

      {isOpen && (
        <div id="neuro-read-panel" className="riff-neuro-panel" role="region" aria-label="Reading Controls">
          {/* Font Size */}
          <div className="riff-neuro-row">
            <span className="riff-neuro-label">Text Size</span>
            <div className="riff-neuro-options">
              {[
                { id: "normal", label: "Standard" },
                { id: "large", label: "Large" },
                { id: "xl", label: "Extra Large" },
              ].map((s) => (
                <button
                  key={s.id}
                  className={`riff-chip ${settings.fontSize === s.id ? "active" : ""}`}
                  onClick={() => update("fontSize", s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line & Letter Spacing */}
          <div className="riff-neuro-row">
            <span className="riff-neuro-label">Line Spacing</span>
            <div className="riff-neuro-options">
              {[
                { id: "normal", label: "Standard" },
                { id: "relaxed", label: "Relaxed" },
                { id: "spacious", label: "Spacious" },
              ].map((l) => (
                <button
                  key={l.id}
                  className={`riff-chip ${settings.lineHeight === l.id ? "active" : ""}`}
                  onClick={() => update("lineHeight", l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="riff-neuro-row">
            <span className="riff-neuro-label">Letter Spacing</span>
            <div className="riff-neuro-options">
              {[
                { id: "normal", label: "Standard" },
                { id: "wide", label: "Wide" },
                { id: "extrawide", label: "Extra Wide" },
              ].map((ls) => (
                <button
                  key={ls.id}
                  className={`riff-chip ${settings.letterSpacing === ls.id ? "active" : ""}`}
                  onClick={() => update("letterSpacing", ls.id)}
                >
                  {ls.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="riff-neuro-row">
            <span className="riff-neuro-label">Font Family</span>
            <div className="riff-neuro-options">
              {READ_FONTS.map((f) => (
                <button
                  key={f.id}
                  className={`riff-chip ${settings.fontFamily === f.id ? "active" : ""}`}
                  onClick={() => update("fontFamily", f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast Theme */}
          <div className="riff-neuro-row">
            <span className="riff-neuro-label">Contrast Theme</span>
            <div className="riff-neuro-options">
              {CONTRAST_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  className={`riff-chip theme-chip ${settings.contrastTheme === theme.id ? "active" : ""}`}
                  style={{
                    backgroundColor: theme.bg,
                    color: theme.text,
                    border: `1px solid ${theme.border || "#c7d4ca"}`,
                  }}
                  onClick={() => update("contrastTheme", theme.id)}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Guide Toggle */}
          <div className="riff-neuro-row">
            <span className="riff-neuro-label">Focus Tools</span>
            <div className="riff-neuro-options">
              <button
                className={`riff-chip ${settings.readingRuler ? "active" : ""}`}
                onClick={() => update("readingRuler", !settings.readingRuler)}
              >
                📏 Reading Ruler {settings.readingRuler ? "ON" : "OFF"}
              </button>
              <button
                className={`riff-chip ${settings.bionicFocus ? "active" : ""}`}
                onClick={() => update("bionicFocus", !settings.bionicFocus)}
              >
                🔍 Bionic Emphasis {settings.bionicFocus ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
