// ConfidenceJourney.jsx
// Cheerful visual confidence milestones showing how the learner's confidence grew.

import { motion } from "framer-motion";

export default function ConfidenceJourney({ points = [] }) {
  const displayPoints = points.length > 0
    ? points
    : [
        { label: "Start", confidence: 0.35 },
        { label: "Story", confidence: 0.55 },
        { label: "Draw", confidence: 0.72 },
        { label: "Teach Riff", confidence: 0.85 },
        { label: "Mastered!", confidence: 0.92 },
      ];

  const latestConfidence = displayPoints[displayPoints.length - 1]?.confidence || 0.5;
  const latestPct = Math.round(latestConfidence * 100);

  return (
    <div className="p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card flex flex-col justify-between space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#2EC4B6] px-3 py-1 rounded-full bg-[#DFF7F0]">
            📈 GROWING CONFIDENCE
          </span>
          <h3 className="font-display text-2xl font-bold text-[#263238] mt-2">
            Your Confidence Climb
          </h3>
          <p className="text-xs text-[#546E7A] mt-1">
            Watch how things got clearer and clearer with every tiny step!
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-[#DFF7F0] text-center border border-[#2EC4B6]/30">
          <span className="text-[10px] font-bold text-[#20A396] block uppercase">Current Feel</span>
          <span className="font-display text-xl font-bold text-[#263238]">{latestPct}% Strong</span>
        </div>
      </div>

      {/* Visual Bouncy Milestone Bars */}
      <div className="pt-6 pb-2">
        <div className="flex items-end justify-between gap-3 h-44 px-2">
          {displayPoints.map((pt, idx) => {
            const pct = Math.round(pt.confidence * 100);
            const isLatest = idx === displayPoints.length - 1;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className={`text-xs font-bold font-sans ${isLatest ? "text-[#6C63FF]" : "text-[#546E7A]"}`}>
                  {pct}%
                </span>

                <div className="w-full max-w-[36px] h-32 bg-[#FFF9F0] rounded-2xl border border-[#E8DEFF] flex items-end p-1 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={`w-full rounded-xl transition-all ${
                      isLatest
                        ? "bg-gradient-to-t from-[#6C63FF] to-[#2EC4B6]"
                        : "bg-[#E8DEFF]"
                    }`}
                  />
                </div>

                <span className="text-xs font-bold text-[#546E7A] text-center truncate max-w-[70px] mt-1">
                  {pt.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#E8DEFF] text-xs text-[#546E7A] text-center font-medium">
        🎉 Every time you practice or teach Riff, your confidence climbs higher!
      </div>
    </div>
  );
}
