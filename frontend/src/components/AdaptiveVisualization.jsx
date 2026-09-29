// AdaptiveVisualization.jsx
// Animated central neural feedback loop:
// LEARNER ↓ RiffSense ↓ RiffAdapt ↙ ↓ ↘ Focus Visual Recall ↘ ↓ ↙ LEARNER

import { motion } from "framer-motion";

export default function AdaptiveVisualization({ currentModality = "text", behaviorState = {} }) {
  const isFriction = behaviorState?.isFrictionDetected;

  const pathways = [
    { id: "focus", label: "RiffFocus", icon: "🧩", outcome: "Task Micro-Steps", active: currentModality === "micro-step" },
    { id: "visual", label: "RiffBoard", icon: "🎨", outcome: "Spatial Models", active: currentModality === "visual" },
    { id: "analogy", label: "Bridge It", icon: "🌉", outcome: "Metaphor Links", active: currentModality === "analogy" },
    { id: "recall", label: "RiffRecall", icon: "🗂️", outcome: "Spaced Retention", active: currentModality === "retrieval" },
  ];

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/[0.035] border border-white/[0.1] backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C084FC] font-semibold px-2.5 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
            Live Neural Feedback Loop
          </span>
          <h3 className="font-display text-2xl text-white font-bold mt-2">
            Riff doesn't just teach. It adapts.
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-white/50">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span>Real-time Telemetry Active</span>
        </div>
      </div>

      {/* Main Signal Architecture Flow */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 py-4">
        {/* Stage 1: Learner Telemetry */}
        <motion.div
          animate={{ scale: isFriction ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.05] border border-white/10 w-full md:w-44 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C3AED]/30 to-[#47BFFF]/30 flex items-center justify-center text-xl mb-2 border border-white/10 shadow-lg">
            👤
          </div>
          <span className="text-xs font-semibold text-white">Learner Interaction</span>
          <span className="text-[10px] text-white/40 mt-1 font-mono">Keystrokes & Pacing</span>
        </motion.div>

        {/* Animated Connector 1 */}
        <div className="hidden md:flex flex-col items-center justify-center w-8">
          <motion.div
            animate={{ x: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-[#C084FC] text-lg"
          >
            ➔
          </motion.div>
        </div>

        {/* Stage 2: RiffSense Detector */}
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.05] border border-white/10 w-full md:w-44 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#10B981]/30 to-[#47BFFF]/30 flex items-center justify-center text-xl mb-2 border border-white/10 shadow-lg">
            ◉
          </div>
          <span className="text-xs font-semibold text-white">RiffSense ML</span>
          <span className="text-[10px] text-[#10B981] mt-1 font-mono">
            {isFriction ? "Friction Alert" : "Pacing Observed"}
          </span>
        </div>

        {/* Animated Connector 2 */}
        <div className="hidden md:flex flex-col items-center justify-center w-8">
          <motion.div
            animate={{ x: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            className="text-[#C084FC] text-lg"
          >
            ➔
          </motion.div>
        </div>

        {/* Stage 3: Central RiffAdapt Brain */}
        <div className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-[#7C3AED]/25 to-[#C084FC]/20 border border-[#9F67FF]/40 w-full md:w-48 text-center shadow-xl shadow-[#7C3AED]/10">
          <div className="w-12 h-12 rounded-full bg-[#7C3AED]/40 flex items-center justify-center text-xl mb-2 border border-[#C084FC]/40 shadow-inner">
            ⚡
          </div>
          <span className="text-xs font-bold text-white">RiffAdapt Engine</span>
          <span className="text-[10px] text-[#C084FC] mt-1 font-mono">Dynamic Routing</span>
        </div>

        {/* Animated Connector 3 */}
        <div className="hidden md:flex flex-col items-center justify-center w-8">
          <motion.div
            animate={{ x: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
            className="text-[#C084FC] text-lg"
          >
            ➔
          </motion.div>
        </div>

        {/* Stage 4: Execution Pathways */}
        <div className="grid grid-cols-2 gap-2 w-full md:w-64">
          {pathways.map((p) => (
            <div
              key={p.id}
              className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                p.active
                  ? "bg-[#7C3AED]/25 border-[#9F67FF]/60 shadow-lg shadow-[#7C3AED]/20"
                  : "bg-white/[0.03] border-white/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{p.icon}</span>
                <span className="font-mono text-[9px] text-white/40">{p.id}</span>
              </div>
              <div>
                <div className={`text-xs font-semibold ${p.active ? "text-white" : "text-white/70"}`}>
                  {p.label}
                </div>
                <div className="text-[9px] text-white/40 leading-tight mt-0.5">{p.outcome}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Feedback Explanation */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
        <span>
          🔁 Closed loop: Real-time telemetry recalibrates your personal baseline and modality affinities without clinical labels.
        </span>
        <span className="font-mono text-[11px] text-[#C084FC]">
          Active Mode: <strong className="text-white capitalize">{currentModality}</strong>
        </span>
      </div>
    </div>
  );
}
