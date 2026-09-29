// AdaptiveTimeline.jsx
// Visual Story of the child's learning journey:
// Started ↓ Got Stuck (Riff noticed) ↓ Tried a picture ↓ Understood ↓ Practiced ↓ Remembered

import { motion } from "framer-motion";

export default function AdaptiveTimeline({ events = [], onClearHistory }) {
  const displayEvents = events.length > 0
    ? events
    : [
        {
          id: "1",
          title: "Started Exploring",
          detail: "Opened a new topic and started thinking!",
          icon: "🚀",
          badge: "Start",
          timestamp: Date.now() - 300000,
        },
      ];

  return (
    <div className="p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card flex flex-col justify-between space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#FFB84D] px-3 py-1 rounded-full bg-[#FFF3D6]">
            📖 LEARNING STORY
          </span>
          <h3 className="font-display text-2xl font-bold text-[#263238] mt-2">
            Your Learning Journey
          </h3>
          <p className="text-xs text-[#546E7A] mt-1">
            See how Riff adjusted every time you needed a different way.
          </p>
        </div>

        {events.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-full bg-[#FFF9F0] hover:bg-[#FFF3D6] text-xs font-bold text-[#546E7A] transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Visual Step-by-Step Story Cards */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {displayEvents.map((evt, idx) => {
          return (
            <motion.div
              key={evt.id || idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#E8DEFF] flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                {evt.icon || "✨"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[#263238] truncate">{evt.title}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#6C63FF] border border-[#E8DEFF]">
                    {evt.badge || "Step"}
                  </span>
                </div>
                <p className="text-xs text-[#546E7A] mt-0.5 leading-relaxed">{evt.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#E8DEFF] text-xs text-[#546E7A] text-center font-medium">
        🌱 Riff changes the learning path whenever you need it!
      </div>
    </div>
  );
}
