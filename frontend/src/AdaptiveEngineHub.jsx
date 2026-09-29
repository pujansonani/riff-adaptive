// AdaptiveEngineHub.jsx
// Central Riff Adaptive Engine Hub:
// Clean glass command center with real vitals, explainability trigger, and autopilot proposal.

import { useState } from "react";
import { AUTOPILOT_STATES } from "./riffController.js";
import { motion } from "framer-motion";

const STATE_CONFIG = {
  focused: { dot: "#10B981", label: "STEADY", sub: "Pacing aligned with personal baseline" },
  uncertain: { dot: "#F59E0B", label: "PONDERING", sub: "Deliberate hesitation observed" },
  struggling: { dot: "#F43F5E", label: "FRICTION DETECTED", sub: "Pacing slowed + revision bursts" },
  disengaging: { dot: "#9F67FF", label: "EXTENDED PAUSE", sub: "Thinking pause on current step" },
};

const MODE_META = {
  text: { icon: "📄", label: "Text Explanation" },
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
    [AUTOPILOT_STATES.OBSERVING]: "● Observing Interaction Cadence",
    [AUTOPILOT_STATES.THINKING]: "✦ Analyzing Understanding",
    [AUTOPILOT_STATES.ADAPTING]: "⚡ Changing Teaching Strategy",
    [AUTOPILOT_STATES.HELPING]: "💡 Offering Focus Support",
    [AUTOPILOT_STATES.LEARNING]: "🌱 Updating Learning DNA",
  };

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/[0.045] border border-white/[0.12] backdrop-blur-2xl shadow-2xl shadow-black/80 relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#C084FC] font-bold px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#9F67FF]/30">
            ✦ RIFF ADAPTIVE ENGINE
          </span>
          <span className="font-mono text-xs text-white/70 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: stateCfg.dot }}
            />
            {autopilotLabels[autopilotState] || autopilotLabels[AUTOPILOT_STATES.OBSERVING]}
          </span>
        </div>

        <button
          onClick={() => setShowOverrideMenu(!showOverrideMenu)}
          className="px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/12 text-xs font-medium text-white/80 hover:text-white transition-all backdrop-blur-md flex items-center gap-1.5"
        >
          <span>🔄 Try Another Way</span>
          <span className="text-[10px]">{showOverrideMenu ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* 4 Core Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Vital 1: Understanding Confidence */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
              Learning Confidence
            </span>
            <span className="font-mono text-base font-bold text-white">{understandingPct}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden my-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${understandingPct}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#47BFFF]"
            />
          </div>
          <span className="text-[11px] text-white/40 mt-1">
            {understandingPct >= 70
              ? "Strong conceptual grasp"
              : understandingPct >= 45
              ? "Developing comprehension"
              : "Building session baseline"}
          </span>
        </div>

        {/* Vital 2: Focus Rhythm */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
              Focus State
            </span>
            <span
              className="font-mono text-sm font-bold flex items-center gap-1.5"
              style={{ color: stateCfg.dot }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: stateCfg.dot }} />
              {stateCfg.label}
            </span>
          </div>
          <span className="text-[11px] text-white/40 mt-auto">{stateCfg.sub}</span>
        </div>

        {/* Vital 3: Current Active Mode */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
              Active Mode
            </span>
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>{currentModeInfo.icon}</span> {currentModeInfo.label}
            </span>
          </div>
          <span className="text-[11px] text-white/40 mt-auto">Adaptive presentation active</span>
        </div>

        {/* Vital 4: Memory Retention Queue */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
              Memory Health
            </span>
            <span className="font-mono text-sm font-bold text-white">
              {retentionStats?.due > 0 ? `${retentionStats.due} Due Now` : "Up to Date"}
            </span>
          </div>
          <span className="text-[11px] text-white/40 mt-auto">
            {retentionStats?.mastered || 0} mastered • {retentionStats?.total || 0} tracked
          </span>
        </div>
      </div>

      {/* Riff Is Adapting Banner */}
      {adaptationDecision && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-[#7C3AED]/20 via-[#47BFFF]/10 to-[#0D0912] border border-[#9F67FF]/30 backdrop-blur-md"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#C084FC] tracking-wider">
              <span>⚡</span> RIFF IS ADAPTING
            </div>
            {onOpenWhyAdapted && (
              <button
                onClick={onOpenWhyAdapted}
                className="text-xs text-[#C084FC] hover:text-white underline font-medium"
              >
                🔍 Why did Riff change?
              </button>
            )}
          </div>

          <p className="font-serif text-lg text-white/95 leading-relaxed mb-4 italic">
            “{adaptationDecision.message}”
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {adaptationDecision.actions?.map((act) => (
              <button
                key={act.id}
                onClick={() => onAcceptAdaptation && onAcceptAdaptation(act.id)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  act.primary
                    ? "bg-gradient-to-r from-[#7C3AED] to-[#C084FC] text-white hover:opacity-90 shadow-lg shadow-[#7C3AED]/20"
                    : "bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white"
                }`}
              >
                {act.label}
              </button>
            ))}
            <button
              onClick={onKeepCurrentModality}
              className="px-4 py-2 rounded-full text-xs font-medium text-white/50 hover:text-white/80 transition-colors"
            >
              Keep current mode
            </button>
          </div>
        </motion.div>
      )}

      {/* Mode Override Drawer */}
      {showOverrideMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10"
        >
          <span className="block font-mono text-[10px] uppercase text-white/50 mb-3">
            Manually switch learning modality:
          </span>
          <div className="flex flex-wrap gap-2">
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
                onClick={() => {
                  if (onSelectModality) onSelectModality(m.id);
                  setShowOverrideMenu(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  currentModality === m.id
                    ? "bg-[#7C3AED] text-white border-[#9F67FF] shadow-md shadow-[#7C3AED]/30"
                    : "bg-white/[0.05] border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
