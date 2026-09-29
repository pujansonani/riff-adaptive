// LearningDNA.jsx
// "How You Like to Learn" — positive, encouraging insights on how the child learns best.

import { motion } from "framer-motion";

export default function LearningDNA({ profile = {}, onSelectModality }) {
  const styles = [
    {
      id: "visual",
      label: "Visuals & Pictures",
      emoji: "🎨",
      bg: "#E8DEFF",
      border: "#D8C4FF",
      desc: "You seem to enjoy seeing ideas drawn out as pictures.",
    },
    {
      id: "micro-step",
      label: "Small Steps",
      emoji: "🪜",
      bg: "#DCEBFF",
      border: "#BEDBFF",
      desc: "Short, bite-sized steps keep things moving without stress.",
    },
    {
      id: "analogy",
      label: "Fun Stories",
      emoji: "🌉",
      bg: "#FFF3D6",
      border: "#FFE099",
      desc: "Stories connecting concepts to your favorite hobbies make things click.",
    },
    {
      id: "audio",
      label: "Listening",
      emoji: "🔊",
      bg: "#DFF7F0",
      border: "#BAEFE2",
      desc: "Hearing things read out loud helps your focus stay sharp.",
    },
    {
      id: "teach-back",
      label: "Teaching Others",
      emoji: "🗣️",
      bg: "#FFE0E5",
      border: "#FFC2CD",
      desc: "Explaining in your own words helps solidify what you know.",
    },
    {
      id: "retrieval",
      label: "Quick Practice",
      emoji: "🧠",
      bg: "#E8DEFF",
      border: "#D8C4FF",
      desc: "Playful memory check-ins keep ideas fresh in your mind.",
    },
  ];

  return (
    <div className="w-full p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#6C63FF] px-3 py-1 rounded-full bg-[#E8DEFF]">
            🌟 YOUR LEARNING STRENGTHS
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#263238] mt-2">
            How You Like to Learn
          </h3>
          <p className="text-[#546E7A] text-xs sm:text-sm mt-1">
            Everyone's brain works in a cool, unique way. Here’s what Riff has noticed works great for you!
          </p>
        </div>
      </div>

      {/* Grid of Friendly Learning Style Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {styles.map((s) => {
          const rawAffinity = profile[s.id]?.affinity !== undefined ? profile[s.id].affinity : 0.6;
          const pct = Math.round(Math.min(100, Math.max(30, rawAffinity * 100)));

          return (
            <div
              key={s.id}
              onClick={() => onSelectModality && onSelectModality(s.id)}
              className="p-5 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.02] shadow-sm"
              style={{ backgroundColor: s.bg, borderColor: s.border }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-xs font-bold font-sans px-2.5 py-1 rounded-full bg-white/80 text-[#263238] shadow-sm">
                    {pct}% Favorite
                  </span>
                </div>
                <h4 className="font-display font-bold text-base text-[#263238] mb-1">
                  {s.label}
                </h4>
                <p className="text-xs text-[#546E7A] font-medium leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#263238]">
                <span>Try this style</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#E8DEFF] text-center text-xs text-[#546E7A] font-medium">
        ✨ Riff updates these ideas as you practice together!
      </div>
    </div>
  );
}
