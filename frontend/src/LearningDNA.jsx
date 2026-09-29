// LearningDNA.jsx
// Visual representation of the learner's dynamic modality profile (Learning DNA).

const MODALITY_META = {
  visual: { icon: "🎨", label: "Visual & Spatial", desc: "Diagrams, flowcharts, and spatial models" },
  "micro-step": { icon: "🧩", label: "Micro-Steps", desc: "De-cluttered, one-instruction-at-a-time sequencing" },
  analogy: { icon: "🌉", label: "Concept Bridges", desc: "Connecting ideas through familiar metaphors" },
  "teach-back": { icon: "🗣️", label: "Teach-Back Roleplay", desc: "Consolidating thinking by explaining to a curious buddy" },
  retrieval: { icon: "🗂️", label: "Active Recall", desc: "Flashcard flips and spaced retrieval practice" },
  audio: { icon: "🔊", label: "Audio & Speech", desc: "Read aloud with word synchronization and speech input" },
  interactive: { icon: "⚡", label: "Interactive Steps", desc: "Mini-challenges and immediate feedback checks" },
  text: { icon: "📄", label: "Clear Text", desc: "Direct concise reading passages and bullet points" },
};

export default function LearningDNA({ profile = {}, onSelectModality }) {
  const rankedModalities = Object.keys(MODALITY_META).map((key) => {
    const stats = profile[key] || { pulls: 1, affinity: 0.6 };
    return {
      key,
      ...MODALITY_META[key],
      affinity: stats.affinity,
      percentage: Math.round(stats.affinity * 100),
      pulls: stats.pulls || 1,
    };
  }).sort((a, b) => b.affinity - a.affinity);

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-400 font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Learner Profile
          </span>
          <h3 className="font-serif text-3xl text-white font-normal mt-2">
            Your Learning DNA
          </h3>
          <p className="text-white/50 text-xs mt-1">
            Based on your recent learning interactions. Riff is learning what works best for you.
          </p>
        </div>
        <div className="font-mono text-[11px] text-white/40 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
          DYNAMIC AFFINITY
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rankedModalities.map((item, idx) => {
          const isTop = idx === 0;
          return (
            <div
              key={item.key}
              onClick={() => onSelectModality && onSelectModality(item.key)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isTop
                  ? "bg-gradient-to-b from-indigo-950/30 to-white/[0.04] border-indigo-400/40 shadow-xl shadow-indigo-500/10"
                  : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-mono text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-white">{item.label}</span>
                  {isTop && (
                    <span className="text-[9px] font-mono text-indigo-300 font-bold px-1.5 py-0.5 rounded bg-indigo-500/20">
                      Top
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 leading-relaxed mb-4">{item.desc}</p>
              </div>

              <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    background: isTop
                      ? "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)"
                      : "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-white/40 italic flex items-center gap-2">
        <span>💡</span>
        <span>These scores adapt dynamically based on comprehension outcomes across each learning modality.</span>
      </div>
    </div>
  );
}
