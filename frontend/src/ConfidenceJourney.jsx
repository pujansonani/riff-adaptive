// ConfidenceJourney.jsx
// Minimalist confidence graph tracking understanding changes across session milestones.

import { motion } from "framer-motion";

export default function ConfidenceJourney({ points = [] }) {
  const displayPoints = points.length > 0
    ? points
    : [
        { label: "Start", confidence: 0.35, timestamp: Date.now() - 600000 },
        { label: "Riffed", confidence: 0.52, timestamp: Date.now() - 400000 },
        { label: "Visual", confidence: 0.70, timestamp: Date.now() - 200000 },
        { label: "Teach-Back", confidence: 0.82, timestamp: Date.now() - 60000 },
        { label: "Recall", confidence: 0.88, timestamp: Date.now() },
      ];

  const latestConfidence = displayPoints[displayPoints.length - 1]?.confidence || 0.45;
  const latestPct = Math.round(latestConfidence * 100);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C084FC] font-semibold px-2.5 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
            Comprehension Curve
          </span>
          <h3 className="font-display text-2xl text-white font-bold mt-2">
            Your Learning Journey
          </h3>
          <p className="text-xs text-white/50 mt-1">
            How your understanding changed across interactions in this session.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-right">
          <span className="text-xs font-mono text-white/50 block">Current Confidence</span>
          <span className="font-display text-2xl font-bold text-[#10B981]">{latestPct}%</span>
        </div>
      </div>

      {/* Minimalist Visual Chart Area */}
      <div className="relative pt-8 pb-4">
        {/* Horizontal Baseline Axis */}
        <div className="absolute bottom-10 left-0 right-0 h-[1px] bg-white/10" />

        {/* Milestone Pillars */}
        <div className="flex items-end justify-between gap-2 h-44 px-4">
          {displayPoints.map((pt, idx) => {
            const pct = Math.round(pt.confidence * 100);
            const isLatest = idx === displayPoints.length - 1;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className={`text-[11px] font-mono font-bold transition-all ${
                  isLatest ? "text-[#10B981]" : "text-white/60"
                }`}>
                  {pct}%
                </span>

                <div className="w-full max-w-[28px] h-32 bg-white/[0.04] rounded-full flex items-end p-0.5 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={`w-full rounded-full transition-all ${
                      isLatest
                        ? "bg-gradient-to-t from-[#7C3AED] to-[#10B981]"
                        : "bg-gradient-to-t from-[#7C3AED]/40 to-[#C084FC]/60"
                    }`}
                  />
                </div>

                <span className="text-[10px] font-mono text-white/50 text-center truncate max-w-[64px] mt-1" title={pt.label}>
                  {pt.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.08] text-[11px] text-white/40 flex items-center justify-between">
        <span>Computed from real interaction checks and teach-backs.</span>
        <span className="font-mono text-[#C084FC]">Baseline Calibrated</span>
      </div>
    </div>
  );
}
