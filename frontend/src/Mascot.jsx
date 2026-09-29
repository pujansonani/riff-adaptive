// Mascot.jsx
// Minimal abstract Riff system presence companion.
// States: observing | thinking | adapting | helping | celebrating

import { motion } from "framer-motion";

export default function RiffMascot({ mood = "observing", accent = "#818cf8" }) {
  const moodConfig = {
    observing: {
      label: "Riff is observing cadence",
      icon: "◉",
      color: "#10b981", // emerald
      pulseDuration: 3,
      desc: "ML Pacing Active",
    },
    thinking: {
      label: "Riff is analyzing understanding",
      icon: "✦",
      color: "#818cf8", // indigo
      pulseDuration: 1.5,
      desc: "Evaluating Logic",
    },
    adapting: {
      label: "Riff is shifting strategy",
      icon: "⚡",
      color: "#ec4899", // pink/rose
      pulseDuration: 1.0,
      desc: "Adapting Strategy",
    },
    offered: {
      label: "Riff offers focus support",
      icon: "💡",
      color: "#f59e0b", // amber
      pulseDuration: 2,
      desc: "Support Ready",
    },
    helping: {
      label: "Riff is guiding step-by-step",
      icon: "🪜",
      color: "#38bdf8", // sky
      pulseDuration: 2.2,
      desc: "Step Mode",
    },
    hinted: {
      label: "Riff provided focused hint",
      icon: "🔍",
      color: "#a855f7", // purple
      pulseDuration: 2,
      desc: "Hint Delivered",
    },
    celebrating: {
      label: "Mastery milestone achieved!",
      icon: "✨",
      color: "#22c55e", // green
      pulseDuration: 1.2,
      desc: "Confidence Boost",
    },
  };

  const current = moodConfig[mood] || moodConfig.observing;

  return (
    <div
      className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg transition-all hover:border-white/20"
      title={current.label}
    >
      {/* Abstract Neural Orbital Indicator */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Outer Orbital Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-white/20"
        />

        {/* Pulsing Core Node */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: current.pulseDuration, ease: "easeInOut" }}
          className="w-2.5 h-2.5 rounded-full shadow-md shadow-current"
          style={{ backgroundColor: current.color, color: current.color }}
        />

        {/* Orbital Satellite Dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: current.pulseDuration * 2, ease: "linear" }}
          className="absolute inset-0 flex items-start justify-center"
        >
          <div
            className="w-1 h-1 rounded-full -mt-0.5"
            style={{ backgroundColor: current.color }}
          />
        </motion.div>
      </div>

      {/* Label and Status */}
      <div className="flex flex-col">
        <span className="text-[11px] font-mono tracking-wider font-semibold text-white/90 flex items-center gap-1.5">
          <span style={{ color: current.color }}>{current.icon}</span>
          {current.desc}
        </span>
      </div>
    </div>
  );
}
