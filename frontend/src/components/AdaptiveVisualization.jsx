// AdaptiveVisualization.jsx
// Friendly interactive visual of Riff with floating capability bubbles connected to Riff.
// When learner state changes, matching bubbles gently glow and pulse.

import { motion } from "framer-motion";

export default function AdaptiveVisualization({ currentModality = "text", behaviorState = {} }) {
  const isFriction = behaviorState?.isFrictionDetected;

  const bubbles = [
    {
      id: "visual",
      label: "Visuals & Pictures",
      emoji: "🎨",
      color: "#6C63FF",
      bg: "#E8DEFF",
      active: currentModality === "visual" || isFriction,
      desc: "Draw it out on canvas",
    },
    {
      id: "micro-step",
      label: "Tiny Steps",
      emoji: "🪜",
      color: "#3A86FF",
      bg: "#DCEBFF",
      active: currentModality === "micro-step" || isFriction,
      desc: "One tiny piece at a time",
    },
    {
      id: "audio",
      label: "Voice & Audio",
      emoji: "🔊",
      color: "#2EC4B6",
      bg: "#DFF7F0",
      active: currentModality === "audio",
      desc: "Listen to explanation",
    },
    {
      id: "analogy",
      label: "Story Bridge",
      emoji: "🌉",
      color: "#FFB84D",
      bg: "#FFF3D6",
      active: currentModality === "analogy",
      desc: "Connect to what you love",
    },
    {
      id: "retrieval",
      label: "Remember Cards",
      emoji: "🧠",
      color: "#FF5E7E",
      bg: "#FFE0E5",
      active: currentModality === "retrieval",
      desc: "Practice quick recall",
    },
    {
      id: "teach-back",
      label: "Teach Riff",
      emoji: "🗣️",
      color: "#534BD6",
      bg: "#E8DEFF",
      active: currentModality === "teach-back",
      desc: "Explain in your own words",
    },
  ];

  return (
    <div className="w-full p-6 sm:p-10 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card relative overflow-hidden">
      {/* Soft Background Tint */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FFF3D6] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#DFF7F0] rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8DEFF] text-[#534BD6] text-xs font-bold font-sans">
          ✨ HOW RIFF HELPS YOU
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#263238]">
          Riff changes how it teaches to fit you
        </h3>
        <p className="text-xs sm:text-sm text-[#546E7A]">
          If you ever get stuck, Riff immediately lights up different ways to understand the concept.
        </p>
      </div>

      {/* Central Mascot and Surrounding Friendly Bubbles */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Central Riff Character Node */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#3A86FF] p-1.5 shadow-xl flex flex-col items-center justify-center text-white mb-8 relative"
        >
          <span className="text-4xl">🌟</span>
          <span className="font-display font-bold text-sm tracking-wide mt-1">RIFF</span>
          <span className="text-[10px] font-sans text-white/80 -mt-0.5">Your Buddy</span>
        </motion.div>

        {/* Surrounding Interactive Capability Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              animate={{
                scale: b.active ? [1, 1.02, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-3.5 ${
                b.active
                  ? "border-[#6C63FF] bg-[#E8DEFF]/60 shadow-bouncy"
                  : "border-[#E8DEFF]/60 bg-[#FFF9F0]/60 hover:bg-white"
              }`}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                style={{ backgroundColor: b.bg }}
              >
                {b.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-[#263238] truncate">
                    {b.label}
                  </h4>
                  {b.active && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6C63FF] text-white">
                      Active ✨
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#546E7A] mt-0.5">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gentle Bottom Reassurance */}
      <div className="mt-8 pt-6 border-t border-[#E8DEFF] text-center text-xs text-[#546E7A] font-medium flex items-center justify-center gap-2">
        <span>💡</span>
        <span>Notice → Understand → Adapt. Always encouraging, never judgmental.</span>
      </div>
    </div>
  );
}
