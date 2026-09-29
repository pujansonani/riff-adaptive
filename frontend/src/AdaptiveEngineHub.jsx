// AdaptiveEngineHub.jsx
// Redesigned Central Adaptive Engine Hub:
// The visual and cognitive command center of Riff Autopilot.
// Displays live comprehension, focus states, current teaching mode, memory queue,
// and adaptive strategy proposals with explainability actions.

import { useState } from "react";
import { AUTOPILOT_STATES } from "./riffController.js";

const STATE_CONFIG = {
  focused: { dot: "#10b981", label: "STEADY", sub: "Cadence aligned with personal baseline" },
  uncertain: { dot: "#f59e0b", label: "PONDERING", sub: "Deliberate hesitation detected" },
  struggling: { dot: "#ff6b4a", label: "FRICTION DETECTED", sub: "Pacing slowed + revision burst" },
  disengaging: { dot: "#8b5cf6", label: "EXTENDED PAUSE", sub: "Inactivity on current step" },
};

const MODE_META = {
  text: { icon: "📄", label: "Text Passage" },
  visual: { icon: "🎨", label: "Visual Model (RiffBoard)" },
  "micro-step": { icon: "🧩", label: "Micro-Steps (Focus)" },
  analogy: { icon: "🌉", label: "Concept Bridge" },
  audio: { icon: "🔊", label: "Audio Read Aloud" },
  interactive: { icon: "🎮", label: "Interactive Steps" },
  "teach-back": { icon: "🗣️", label: "Teach-Back Roleplay" },
  retrieval: { icon: "🗂️", label: "Active Recall" },
};

export default function AdaptiveEngineHub({
  autopilotState = AUTOPILOT_STATES.OBSERVING,
  behaviorState = {},
  understandingConfidence = null,
  currentModality = "text",
  adaptationDecision = null,
  retentionStats = {},
  onAcceptAdaptation,
  onKeepCurrentModality,
  onOpenWhyAdapted,
  onSelectModality,
}) {
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);

  const stateCfg = STATE_CONFIG[behaviorState?.state] || STATE_CONFIG.focused;
  const currentModeInfo = MODE_META[currentModality] || MODE_META.text;

  const understandingPct = understandingConfidence !== null
    ? Math.round(understandingConfidence * 100)
    : 45;

  const autopilotLabels = {
    [AUTOPILOT_STATES.OBSERVING]: "● Riff is observing your cadence",
    [AUTOPILOT_STATES.THINKING]: "✦ Riff is analyzing understanding",
    [AUTOPILOT_STATES.ADAPTING]: "⚡ Riff is changing teaching strategy",
    [AUTOPILOT_STATES.HELPING]: "💡 Riff is offering focus support",
    [AUTOPILOT_STATES.LEARNING]: "🌱 Riff is updating your Learning DNA",
  };

  return (
    <div className="riff-adaptive-hub-card">
      {/* Top Header Row */}
      <div className="riff-hub-header-row">
        <div className="hub-title-badge-group">
          <span className="riff-hub-badge">✦ RIFF ADAPTIVE ENGINE</span>
          <span className={`autopilot-status-pill ${autopilotState}`}>
            {autopilotLabels[autopilotState] || autopilotLabels[AUTOPILOT_STATES.OBSERVING]}
          </span>
        </div>

        <div className="hub-quick-actions">
          <button
            className="riff-btn-small ghost"
            onClick={() => setShowOverrideMenu(!showOverrideMenu)}
            aria-expanded={showOverrideMenu}
          >
            🔄 Try Another Way {showOverrideMenu ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* 4 Core Vital Signs Grid */}
      <div className="riff-hub-vitals-grid">
        {/* Vital 1: Understanding Confidence */}
        <div className="riff-vital-card">
          <div className="vital-top">
            <span className="vital-label">Learning Confidence</span>
            <span className="vital-val-bold">{understandingPct}%</span>
          </div>
          <div className="vital-progress-track">
            <div
              className="vital-progress-fill"
              style={{
                width: `${understandingPct}%`,
                background:
                  understandingPct >= 70
                    ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                    : understandingPct >= 45
                    ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
                    : "linear-gradient(90deg, #ff6b4a 0%, #e11d48 100%)",
              }}
            />
          </div>
          <span className="vital-sub">
            {understandingPct >= 70
              ? "Strong conceptual grasp"
              : understandingPct >= 45
              ? "Developing comprehension"
              : "Awaiting answer feedback"}
          </span>
        </div>

        {/* Vital 2: Focus & Rhythm */}
        <div className="riff-vital-card">
          <div className="vital-top">
            <span className="vital-label">Focus State</span>
            <span className="vital-val-bold" style={{ color: stateCfg.dot }}>
              <span className="dot pulse" style={{ background: stateCfg.dot, marginRight: 6 }} />
              {stateCfg.label}
            </span>
          </div>
          <span className="vital-sub" style={{ marginTop: 8 }}>
            {stateCfg.sub}
          </span>
        </div>

        {/* Vital 3: Current Teaching Mode */}
        <div className="riff-vital-card">
          <div className="vital-top">
            <span className="vital-label">Current Mode</span>
            <span className="vital-val-bold">
              {currentModeInfo.icon} {currentModeInfo.label}
            </span>
          </div>
          <span className="vital-sub" style={{ marginTop: 8 }}>
            Active multimodal presentation
          </span>
        </div>

        {/* Vital 4: Memory Health Queue */}
        <div className="riff-vital-card">
          <div className="vital-top">
            <span className="vital-label">Memory Health</span>
            <span className="vital-val-bold">
              {retentionStats?.due > 0 ? `${retentionStats.due} Due Now` : "Up to Date"}
            </span>
          </div>
          <span className="vital-sub" style={{ marginTop: 8 }}>
            {retentionStats?.mastered || 0} mastered • {retentionStats?.total || 0} tracked
          </span>
        </div>
      </div>

      {/* Riff Is Adapting Banner (Autonomous or Proposed Interventions) */}
      {adaptationDecision && (
        <div className="riff-is-adapting-box">
          <div className="adapting-box-header">
            <div className="adapting-badge">
              <span>⚡</span> RIFF IS ADAPTING
            </div>
            {onOpenWhyAdapted && (
              <button className="riff-explain-trigger-btn" onClick={onOpenWhyAdapted}>
                🔍 Why Riff adapted?
              </button>
            )}
          </div>

          <p className="adapting-quote">“{adaptationDecision.message}”</p>

          <div className="adapting-actions-row">
            {adaptationDecision.actions?.map((act) => (
              <button
                key={act.id}
                className={`riff-btn-small ${act.primary ? "accept" : "ghost"}`}
                onClick={() => onAcceptAdaptation && onAcceptAdaptation(act.id)}
              >
                {act.label}
              </button>
            ))}
            <button className="riff-btn-small dismiss" onClick={onKeepCurrentModality}>
              Keep current mode
            </button>
          </div>
        </div>
      )}

      {/* Manual Modality Override Drawer */}
      {showOverrideMenu && (
        <div className="riff-mode-override-drawer">
          <span className="override-title">Riff can teach this concept as:</span>
          <div className="override-chips-grid">
            {[
              { id: "visual", icon: "🎨", label: "Visual (RiffBoard)" },
              { id: "micro-step", icon: "🧩", label: "Step-by-Step" },
              { id: "analogy", icon: "🌉", label: "Concept Bridge" },
              { id: "audio", icon: "🔊", label: "Audio Narration" },
              { id: "interactive", icon: "🎮", label: "Interactive Steps" },
              { id: "teach-back", icon: "🗣️", label: "Teach It Back" },
              { id: "retrieval", icon: "🗂️", label: "Recall Flashcards" },
            ].map((m) => (
              <button
                key={m.id}
                className={`override-chip ${currentModality === m.id ? "active" : ""}`}
                onClick={() => {
                  if (onSelectModality) onSelectModality(m.id);
                  setShowOverrideMenu(false);
                }}
              >
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
