// AdaptiveEngineHub.jsx
// Main Adaptive Neuro-Learning Engine Hub:
// Presents learner state (understanding, focus state, modality affinity, retention queue)
// and houses the dynamic "[Try another way]" modality switch and "[Insights]" inspector.

import { useState } from "react";
import { MODALITIES } from "./modalityProfile.js";

const STATE_COLORS = {
  focused: { dot: "#10b981", label: "Focused Cadence", bg: "#ecfdf5", text: "#065f46" },
  uncertain: { dot: "#f59e0b", label: "Exploring / Pondering", bg: "#fffbeb", text: "#92400e" },
  struggling: { dot: "#ff6b4a", label: "Friction Detected", bg: "#fff1f2", text: "#9f1239" },
  disengaging: { dot: "#8b5cf6", label: "Extended Pause", bg: "#f5f3ff", text: "#5b21b6" },
};

export default function AdaptiveEngineHub({
  adaptationDecision,
  behaviorState,
  understandingConfidence,
  modalityInsights,
  retentionStats,
  onSelectModality,
  learningSignals,
}) {
  const [showModalityMenu, setShowModalityMenu] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const stateCfg = STATE_COLORS[behaviorState?.state] || STATE_COLORS.focused;
  const understandingPct = understandingConfidence !== null
    ? Math.round(understandingConfidence * 100)
    : null;

  return (
    <div className="riff-adaptive-hub-card">
      <div className="riff-hub-header">
        <div className="riff-hub-title-group">
          <div className="riff-hub-badge">ADAPTIVE NEURO-LEARNING ENGINE</div>
          <h2 className="riff-hub-heading">Riff is adapting to your rhythm</h2>
        </div>

        <div className="riff-hub-actions">
          <button
            className="riff-btn-small accept"
            onClick={() => setShowModalityMenu(!showModalityMenu)}
            aria-expanded={showModalityMenu}
          >
            🔄 Try another way
          </button>
          <button
            className={`riff-btn-small ${showInsights ? "accept" : "ghost"}`}
            onClick={() => setShowInsights(!showInsights)}
            aria-expanded={showInsights}
          >
            🔬 {showInsights ? "Hide Insights" : "Learner Insights"}
          </button>
        </div>
      </div>

      {/* Primary Adaptive Status Indicators */}
      <div className="riff-hub-grid">
        {/* Understanding */}
        <div className="riff-hub-cell">
          <div className="cell-header">
            <span className="indicator-dot" style={{ background: "#2d6e5e" }} />
            <span className="cell-title">Understanding</span>
          </div>
          <div className="cell-value">
            {understandingPct !== null ? `${understandingPct}%` : "In Progress"}
          </div>
          <div className="cell-sub">
            {understandingPct !== null && understandingPct >= 70
              ? "Strong conceptual grasp"
              : understandingPct !== null
              ? "Refining details"
              : "Awaiting answer submission"}
          </div>
        </div>

        {/* Focus & Rhythm */}
        <div className="riff-hub-cell">
          <div className="cell-header">
            <span className="indicator-dot pulse" style={{ background: stateCfg.dot }} />
            <span className="cell-title">Focus State</span>
          </div>
          <div className="cell-value" style={{ color: stateCfg.text }}>
            {stateCfg.label}
          </div>
          <div className="cell-sub">
            {behaviorState?.isFrictionDetected
              ? "Adaptation ready to assist"
              : "Steady rhythm against personal baseline"}
          </div>
        </div>

        {/* Learning Modality */}
        <div className="riff-hub-cell">
          <div className="cell-header">
            <span className="indicator-dot" style={{ background: "#8b5cf6" }} />
            <span className="cell-title">Best Modality</span>
          </div>
          <div className="cell-value capitalize">
            {modalityInsights?.topModality || "Analogy"}
          </div>
          <div className="cell-sub">
            {Math.round((modalityInsights?.topAffinity || 0.65) * 100)}% historical affinity
          </div>
        </div>

        {/* Retention Queue */}
        <div className="riff-hub-cell">
          <div className="cell-header">
            <span className="indicator-dot" style={{ background: "#f59e0b" }} />
            <span className="cell-title">Memory Queue</span>
          </div>
          <div className="cell-value">
            {retentionStats?.due > 0 ? `${retentionStats.due} Due` : "Up to Date"}
          </div>
          <div className="cell-sub">
            {retentionStats?.mastered || 0} / {retentionStats?.total || 0} concepts mastered
          </div>
        </div>
      </div>

      {/* Adaptive Recommendation Banner */}
      {adaptationDecision && adaptationDecision.message && (
        <div className="riff-adaptive-nudge-banner">
          <div className="nudge-text">
            <strong>🤖 Adaptive Suggestion:</strong> {adaptationDecision.message}
          </div>
          {adaptationDecision.actions && adaptationDecision.actions.length > 0 && (
            <div className="nudge-actions">
              {adaptationDecision.actions.map((act) => (
                <button
                  key={act.id}
                  className={`riff-btn-small ${act.primary ? "accept" : "ghost"}`}
                  onClick={() => onSelectModality(act.id)}
                >
                  {act.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* "Try another way" Modality Drawer */}
      {showModalityMenu && (
        <div className="riff-modality-picker-modal" role="region" aria-label="Learning Modality Selector">
          <div className="picker-title">Switch Learning Modality</div>
          <div className="riff-modality-grid">
            {[
              { id: "whiteboard", icon: "🎨", label: "RiffBoard Canvas", desc: "Draw, sketch & visualize concepts" },
              { id: "step_mode", icon: "🪜", label: "Micro-Steps (Focus)", desc: "De-cluttered one-step instructions" },
              { id: "audio", icon: "🔊", label: "Audio Read Aloud", desc: "Listen with synchronized word tracking" },
              { id: "bridge", icon: "🌉", label: "Bridge It", desc: "3-step metaphor chain to your interest" },
              { id: "teachback", icon: "🗣️", label: "Teach It Back", desc: "Explain it to an in-world character" },
              { id: "flashcards", icon: "🗂️", label: "Flashcards & Recall", desc: "Spaced repetition memory practice" },
              { id: "neuro_read", icon: "📖", label: "Reading Support", desc: "Accessible fonts, spacing & contrast" },
            ].map((m) => (
              <button
                key={m.id}
                className="riff-modality-card"
                onClick={() => {
                  onSelectModality(m.id);
                  setShowModalityMenu(false);
                }}
              >
                <span className="modality-icon">{m.icon}</span>
                <span className="modality-name">{m.label}</span>
                <span className="modality-desc">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Learner Insights Inspector */}
      {showInsights && (
        <div className="riff-insights-drawer">
          <div className="insights-header">
            <h4>🔬 Learner Telemetry & Behavioral Model</h4>
            <span className="insights-disclaimer">
              *Signals compared strictly to your own baseline — never to other learners. No medical labels.
            </span>
          </div>

          <div className="riff-insights-grid">
            <div className="insight-stat-box">
              <span className="insight-lbl">Personal Baseline Pace</span>
              <span className="insight-val">{learningSignals?.baselineMean || 260} ms / key</span>
            </div>
            <div className="insight-stat-box">
              <span className="insight-lbl">Current Pacing Z-Score</span>
              <span className="insight-val">{learningSignals?.typingPacingZScore || "0.00"} σ</span>
            </div>
            <div className="insight-stat-box">
              <span className="insight-lbl">Backspace Revision Ratio</span>
              <span className="insight-val">
                {Math.round((learningSignals?.backspaceRatio || 0) * 100)}%
              </span>
            </div>
            <div className="insight-stat-box">
              <span className="insight-lbl">ML Friction Probability</span>
              <span className="insight-val">
                {Math.round((behaviorState?.frictionScore || 0) * 100)}%
              </span>
            </div>
          </div>

          <div className="insights-modality-chart">
            <span className="chart-heading">Modality Affinity Distribution</span>
            <div className="modality-bars">
              {(modalityInsights?.ranked || []).map((r) => (
                <div key={r.modality} className="modality-bar-row">
                  <span className="bar-label">{r.modality}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.round(r.affinity * 100)}%` }}
                    />
                  </div>
                  <span className="bar-val">{Math.round(r.affinity * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
