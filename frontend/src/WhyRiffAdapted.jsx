// WhyRiffAdapted.jsx
// Simple, transparent, child-friendly explanation of why Riff switched teaching strategies.

import { motion } from "framer-motion";

export default function WhyRiffAdapted({
  adaptationRecord,
  isOpen,
  onClose,
  onProvideFeedback,
}) {
  if (!isOpen || !adaptationRecord) return null;

  const {
    fromModality = "text",
    toModality = "visual",
    observedSignals = [],
    reasonText = "",
  } = adaptationRecord;

  const modalityNames = {
    text: "Reading the text",
    visual: "Drawing with pictures",
    "micro-step": "Breaking into tiny steps",
    analogy: "Connecting to a fun story",
    audio: "Listening out loud",
    interactive: "Interactive game",
    "teach-back": "Teaching Riff",
    retrieval: "Quick memory check",
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#263238]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-2xl space-y-6 relative"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-[#6C63FF] px-3.5 py-1 rounded-full bg-[#E8DEFF]">
            💡 RIFF'S THINKING
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFF9F0] hover:bg-[#FFE0E5] text-[#546E7A] hover:text-[#FF5E7E] flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <h3 className="font-display text-2xl font-bold text-[#263238]">
          Why did Riff change this?
        </h3>

        {/* Change Transition Card */}
        <div className="p-4 rounded-3xl bg-[#FFF9F0] border border-[#E8DEFF] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#546E7A] uppercase block">Started with</span>
            <strong className="text-sm font-display text-[#263238]">{modalityNames[fromModality] || fromModality}</strong>
          </div>
          <span className="text-2xl text-[#6C63FF]">➔</span>
          <div>
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase block">Switched to</span>
            <strong className="text-sm font-display text-[#2EC4B6]">{modalityNames[toModality] || toModality}</strong>
          </div>
        </div>

        {/* What Riff Noticed */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#263238] uppercase">
            Riff noticed:
          </span>
          <ul className="space-y-1.5 pl-4 text-xs text-[#546E7A] font-semibold list-disc">
            {observedSignals.map((sig, i) => (
              <li key={i}>{sig}</li>
            ))}
          </ul>
        </div>

        {/* Friendly explanation */}
        <div className="p-4 rounded-2xl bg-[#DFF7F0] border border-[#DFF7F0] text-xs text-[#20A396] font-bold leading-relaxed">
          ✨ {reasonText || "A different style might make this click way faster!"}
        </div>

        {/* Friendly Feedback Buttons */}
        <div className="pt-4 border-t border-[#E8DEFF] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#546E7A]">Did this help?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("helped");
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-[#DFF7F0] text-[#20A396] text-xs font-bold hover:bg-[#C2F2E4]"
            >
              👍 Yes, loved it!
            </button>
            <button
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("somewhat");
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-[#FFF3D6] text-[#E08A00] text-xs font-bold hover:bg-[#FFE6A3]"
            >
              👌 A little
            </button>
            <button
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("not_really");
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-[#FFE0E5] text-[#FF5E7E] text-xs font-bold hover:bg-[#FFCCD5]"
            >
              👎 Not really
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
