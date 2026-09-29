// AdaptiveTimeline.jsx
// Visual timeline of the learner's session journey generated from real session events.

export default function AdaptiveTimeline({ events = [], onClearHistory }) {
  const displayEvents = events.length > 0 ? events : [
    {
      id: "initial-event",
      timeStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "lesson_start",
      title: "Session Initialized",
      detail: "Riff is ready to observe and adapt to your learning rhythm.",
      icon: "🌱",
      badge: "Session Start",
    },
  ];

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-400 font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Chronology
          </span>
          <h3 className="font-serif text-3xl text-white font-normal mt-2">
            Today's Learning Journey
          </h3>
          <p className="text-white/50 text-xs mt-1">
            Real-time record of observations, cognitive adaptations, and retention milestones.
          </p>
        </div>
        {events.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white/60 hover:text-white transition-all"
          >
            Reset Journey
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {displayEvents.map((evt, idx) => {
          const isLast = idx === displayEvents.length - 1;

          return (
            <div key={evt.id || idx} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-sm shadow-md group-hover:border-indigo-400 transition-colors">
                  {evt.icon || "●"}
                </div>
                {!isLast && <div className="w-px flex-1 bg-white/10 my-1" />}
              </div>

              <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all mb-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{evt.title}</span>
                    {evt.badge && (
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {evt.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-white/40">{evt.timeStr}</span>
                </div>
                {evt.detail && (
                  <p className="text-xs text-white/60 leading-relaxed mt-1">{evt.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
