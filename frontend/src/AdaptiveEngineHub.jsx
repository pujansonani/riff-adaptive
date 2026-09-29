// AdaptiveEngineHub.jsx
// Warm, kid-friendly learning hub showing encouraging progress,
// adaptive suggestions ("Let's try a different way"), and simple visual feedback.

import { useState } from "react";
import { AUTOPILOT_STATES } from "./riffController.js";
import { motion } from "framer-motion";

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

  const isStuck = behaviorState?.isFrictionDetected;

  return (
    <div className="w-full p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card space-y-6">
      {/* Top Header Row with Mascot status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF3D6] flex items-center justify-center text-xl shadow-sm">
            🌱
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[#263238]">
              Your Learning Today
            </h3>
            <p className="text-xs text-[#546E7A]">
              Riff is cheering you on and learning how you like to think!
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowOverrideMenu(!showOverrideMenu)}
          className="px-4 py-2 rounded-full bg-[#FFF9F0] hover:bg-[#FFF3D6] border border-[#E8DEFF] text-xs font-bold text-[#546E7A] hover:text-[#263238] transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>🔄 Pick Another Way</span>
          <span className="text-[10px]">{showOverrideMenu ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* 3 Simple Encouraging Cards (No intimidating SaaS analytics!) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Understanding / Feeling Good */}
        <div className="p-4 rounded-3xl bg-[#DFF7F0]/60 border border-[#DFF7F0] flex items-center gap-3.5">
          <span className="text-3xl">🎯</span>
          <div>
            <span className="text-xs font-bold text-[#20A396] uppercase tracking-wide block">
              Understanding
            </span>
            <strong className="font-display text-base text-[#263238] block">
              {understandingConfidence !== null ? `${Math.round(understandingConfidence * 100)}% Mastered` : "Building baseline"}
            </strong>
          </div>
        </div>

        {/* Card 2: Rhythm / Pace */}
        <div className="p-4 rounded-3xl bg-[#DCEBFF]/60 border border-[#DCEBFF] flex items-center gap-3.5">
          <span className="text-3xl">{isStuck ? "💡" : "✨"}</span>
          <div>
            <span className="text-xs font-bold text-[#3A86FF] uppercase tracking-wide block">
              Pacing
            </span>
            <strong className="font-display text-base text-[#263238] block">
              {isStuck ? "Ready for a hint" : "Smooth & Steady"}
            </strong>
          </div>
        </div>

        {/* Card 3: Memory Cards */}
        <div className="p-4 rounded-3xl bg-[#FFE0E5]/60 border border-[#FFE0E5] flex items-center gap-3.5">
          <span className="text-3xl">🧠</span>
          <div>
            <span className="text-xs font-bold text-[#FF5E7E] uppercase tracking-wide block">
              Memory Practice
            </span>
            <strong className="font-display text-base text-[#263238] block">
              {retentionStats?.due > 0 ? `${retentionStats.due} due to review` : "All caught up!"}
            </strong>
          </div>
        </div>
      </div>

      {/* ADAPTIVE INTERVENTION CARD ("Let's try a different way") */}
      {adaptationDecision && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gradient-to-r from-[#FFF3D6] via-[#FFE0E5] to-[#E8DEFF] border-2 border-[#FFB84D]/40 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 font-display text-sm font-bold text-[#263238]">
              <span>💡</span> Let’s try a different way!
            </div>
            {onOpenWhyAdapted && (
              <button
                onClick={onOpenWhyAdapted}
                className="text-xs font-bold text-[#6C63FF] hover:underline"
              >
                Why did Riff suggest this?
              </button>
            )}
          </div>

          <p className="font-sans text-sm text-[#263238] font-semibold leading-relaxed mb-4">
            “{adaptationDecision.message}”
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            {adaptationDecision.actions?.map((act) => (
              <button
                key={act.id}
                onClick={() => onAcceptAdaptation && onAcceptAdaptation(act.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  act.primary
                    ? "bg-[#6C63FF] text-white shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none"
                    : "bg-white text-[#263238] border border-[#E8DEFF] hover:bg-[#FFF9F0]"
                }`}
              >
                {act.label}
              </button>
            ))}
            <button
              onClick={onKeepCurrentModality}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#546E7A] hover:text-[#263238]"
            >
              Keep going my way
            </button>
          </div>
        </motion.div>
      )}

      {/* Modality Override Drawer */}
      {showOverrideMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-5 rounded-3xl bg-[#FFF9F0] border border-[#E8DEFF]"
        >
          <span className="block font-display text-xs font-bold text-[#546E7A] uppercase mb-3">
            How would you like Riff to teach right now?
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "visual", icon: "🎨", label: "Show me with drawings" },
              { id: "micro-step", icon: "🪜", label: "Break into tiny steps" },
              { id: "analogy", icon: "🌉", label: "Connect to a fun story" },
              { id: "audio", icon: "🔊", label: "Read it out loud" },
              { id: "teach-back", icon: "🗣️", label: "Let me teach Riff" },
              { id: "retrieval", icon: "🧠", label: "Quick memory quiz" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  if (onSelectModality) onSelectModality(m.id);
                  setShowOverrideMenu(false);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  currentModality === m.id
                    ? "bg-[#6C63FF] text-white border-[#534BD6] shadow-sm"
                    : "bg-white border-[#E8DEFF] text-[#263238] hover:bg-[#FFF3D6]"
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
