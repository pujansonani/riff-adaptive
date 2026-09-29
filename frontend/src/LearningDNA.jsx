// LearningDNA.jsx
// Dynamic modality affinity breakdown computed from actual learner interactions (not fixed personality traits).

import { motion } from "framer-motion";

export default function LearningDNA({ profile = {}, onSelectModality }) {
  const modalities = [
    { id: "visual", label: "Visual Spatial (RiffBoard)", icon: "🎨", color: "#9F67FF" },
    { id: "micro-step", label: "Micro-Step Sequencing", icon: "🧩", color: "#47BFFF" },
    { id: "analogy", label: "Metaphor Bridge", icon: "🌉", color: "#C084FC" },
    { id: "audio", label: "Audio Read Aloud", icon: "🔊", color: "#38BDF8" },
    { id: "teach-back", label: "Teach-Back Roleplay", icon: "🗣️", color: "#818CF8" },
    { id: "retrieval", label: "Active Recall Spacing", icon: "🗂️", color: "#10B981" },
    { id: "interactive", label: "Interactive Steps", icon: "🎮", color: "#F59E0B" },
    { id: "text", label: "Text Passage", icon: "📄", color: "#CBD5E1" },
  ];

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C084FC] font-semibold px-2.5 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
            Learner State Profile
          </span>
          <h3 className="font-display text-2xl sm:text-3xl text-white font-bold mt-2">
            Your Learning DNA
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Based on your recent interaction outcomes — dynamic tendencies, not permanent diagnostic labels.
          </p>
        </div>
      </div>

      {/* Modality Affinities Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modalities.map((m) => {
          const rawAffinity = profile[m.id]?.affinity !== undefined ? profile[m.id].affinity : 0.5;
          const pct = Math.round(Math.min(100, Math.max(15, rawAffinity * 100)));
          const successes = profile[m.id]?.successes || 0;

          return (
            <div
              key={m.id}
              onClick={() => onSelectModality && onSelectModality(m.id)}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{m.icon}</span>
                  <span className="text-xs font-semibold text-white group-hover:text-[#C084FC] transition-colors">
                    {m.label}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-white/90">{pct}%</span>
              </div>

              <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden my-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>{successes > 0 ? `${successes} positive outcomes` : "Calibrating..."}</span>
                <span className="text-[#C084FC] group-hover:translate-x-0.5 transition-transform">Practice →</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/[0.08] text-[11px] text-white/40 flex items-center justify-between">
        <span>DNA weights adjust dynamically with each answer submission and interaction check.</span>
        <span className="font-mono text-[#10B981]">Adaptive Engine Synced</span>
      </div>
    </div>
  );
}
