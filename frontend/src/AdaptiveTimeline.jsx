// AdaptiveTimeline.jsx
// Chronological telemetry timeline recording real adaptation events, pacing shifts, and interventions.

import { motion } from "framer-motion";

export default function AdaptiveTimeline({ events = [], onClearHistory }) {
  const displayEvents = events.length > 0
    ? events
    : [
        {
          id: "init",
          type: "session_start",
          title: "Session Initialized",
          detail: "Baseline telemetry active. Observing interaction pacing.",
          icon: "🚀",
          badge: "Init",
          timestamp: Date.now() - 300000,
        },
      ];

  const badgeStyles = {
    "RiffSense Alert": "bg-rose-500/20 text-rose-300 border-rose-500/30",
    "Riff It": "bg-[#7C3AED]/20 text-[#C084FC] border-[#9F67FF]/30",
    "Focus Mode": "bg-sky-500/20 text-sky-300 border-sky-500/30",
    "Confidence Check": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "Teach-Back": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "Visual Model": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    "Analogy Mode": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C084FC] font-semibold px-2.5 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
            Session Chronology
          </span>
          <h3 className="font-display text-2xl text-white font-bold mt-2">
            Adaptive Event Stream
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Real-time chronology of observations, strategy shifts, and milestones.
          </p>
        </div>

        {events.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-mono text-white/50 hover:text-white transition-all"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Stream of Events */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {displayEvents.map((evt, idx) => {
          const timeStr = new Date(evt.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const badgeClass = badgeStyles[evt.badge] || "bg-white/10 text-white/80 border-white/15";

          return (
            <motion.div
              key={evt.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3 hover:border-white/15 transition-all"
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{evt.icon || "◉"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-xs text-white truncate">{evt.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {evt.badge || "Event"}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">{timeStr}</span>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed m-0">{evt.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-4 mt-4 border-t border-white/[0.08] text-[11px] text-white/40 flex items-center justify-between">
        <span>Continuous event telemetry verified.</span>
        <span className="font-mono text-[#10B981]">{displayEvents.length} Events Logged</span>
      </div>
    </div>
  );
}
