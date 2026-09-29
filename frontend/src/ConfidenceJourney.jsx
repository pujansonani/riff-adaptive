// ConfidenceJourney.jsx
// Visual learning confidence graph tracking comprehension progression across session milestones.

export default function ConfidenceJourney({ points = [] }) {
  const displayPoints = points.length > 0 ? points : [
    { id: "p1", label: "Start", confidence: 0.35, percentage: 35 },
    { id: "p2", label: "Riffed", confidence: 0.52, percentage: 52 },
  ];

  const currentConfidence = displayPoints[displayPoints.length - 1]?.percentage || 50;

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-400 font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Session Analytics
          </span>
          <h3 className="font-serif text-3xl text-white font-normal mt-2">
            Your Learning Journey
          </h3>
          <p className="text-white/50 text-xs mt-1">
            How your conceptual grasp evolves through interactive practice and adaptations.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/10">
          <span className="font-mono text-2xl font-bold text-emerald-400">{currentConfidence}%</span>
          <span className="text-xs text-white/50 leading-tight">Current<br />Confidence</span>
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex h-56 gap-4 my-6">
        <div className="flex flex-col justify-between font-mono text-[10px] text-white/40 pb-6 pr-2">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        <div className="flex-1 relative border-l border-b border-white/10 pb-6">
          {/* Subtle Grid lines */}
          <div className="absolute left-0 right-0 top-0 h-px bg-white/[0.04]" />
          <div className="absolute left-0 right-0 top-1/4 h-px bg-white/[0.04]" />
          <div className="absolute left-0 right-0 top-2/4 h-px bg-white/[0.04]" />
          <div className="absolute left-0 right-0 top-3/4 h-px bg-white/[0.04]" />

          {/* Points Columns */}
          <div className="absolute inset-0 bottom-6 flex items-end justify-around px-4">
            {displayPoints.map((pt, idx) => {
              const heightPct = Math.min(100, Math.max(12, pt.percentage));
              const isLatest = idx === displayPoints.length - 1;

              return (
                <div key={pt.id || idx} className="flex flex-col items-center h-full w-14 group">
                  <div className="flex-1 w-3.5 flex items-end bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`w-full rounded-full transition-all duration-700 relative ${
                        isLatest
                          ? "bg-gradient-to-t from-indigo-500 to-emerald-400 shadow-lg shadow-emerald-500/20"
                          : "bg-white/20"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-white whitespace-nowrap opacity-80 group-hover:opacity-100">
                        {pt.percentage}%
                      </span>
                    </div>
                  </div>
                  <span className="absolute -bottom-5 font-mono text-[10px] text-white/50 whitespace-nowrap">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-[11px] text-white/40 italic pt-2">
        *Learning confidence measures conceptual clarity and answer alignment — not fixed capability.
      </div>
    </div>
  );
}
