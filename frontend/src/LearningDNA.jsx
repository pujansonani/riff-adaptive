// LearningDNA.jsx
// Visual representation of the learner's dynamic modality profile (Learning DNA).
// Highlights relative affinity without fixed labels.

const MODALITY_META = {
  visual: { icon: "🎨", label: "Visual & Spatial", desc: "Diagrams, flowcharts, and canvas models" },
  "micro-step": { icon: "🪜", label: "Micro-Steps", desc: "De-cluttered, one-instruction-at-a-time sequencing" },
  analogy: { icon: "🌉", label: "Concept Bridges", desc: "Connecting ideas through familiar interests and metaphors" },
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
    <div className="riff-learning-dna-card">
      <div className="riff-dna-header">
        <div>
          <span className="riff-panel-label" style={{ margin: 0 }}>
            Your Learning DNA
          </span>
          <p className="riff-dna-subtitle">
            Based on your recent learning interactions. Riff is learning what works best for you.
          </p>
        </div>
        <div className="riff-dna-badge">DYNAMIC PROFILE</div>
      </div>

      <div className="riff-dna-grid">
        {rankedModalities.map((item, idx) => {
          const isTop = idx === 0;
          return (
            <div
              key={item.key}
              className={`riff-dna-item ${isTop ? "top-modality" : ""}`}
              onClick={() => onSelectModality && onSelectModality(item.key)}
              title={`Click to try ${item.label} mode`}
            >
              <div className="dna-item-top">
                <div className="dna-icon-name">
                  <span className="dna-icon">{item.icon}</span>
                  <div>
                    <span className="dna-label">{item.label}</span>
                    {isTop && <span className="top-pill">★ Highest Affinity</span>}
                  </div>
                </div>
                <span className="dna-pct">{item.percentage}%</span>
              </div>

              <div className="dna-bar-track">
                <div
                  className="dna-bar-fill"
                  style={{
                    width: `${item.percentage}%`,
                    background: isTop
                      ? "linear-gradient(90deg, var(--riff-coral) 0%, #f59e0b 100%)"
                      : "linear-gradient(90deg, var(--riff-teal) 0%, #10b981 100%)",
                  }}
                />
              </div>

              <p className="dna-desc">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="riff-dna-footer">
        <span>
          💡 <strong>Tip:</strong> These affinities dynamically adjust as you interact with different learning tools in Riff.
        </span>
      </div>
    </div>
  );
}
