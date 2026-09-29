// WhyRiffAdapted.jsx
// Student-friendly explainability modal for Riff Autopilot.

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
    text: "Text Explanation",
    visual: "Visual Diagram (RiffBoard)",
    "micro-step": "Step-by-Step Focus Mode",
    analogy: "Concept Bridge (Analogy)",
    audio: "Audio Read Aloud",
    interactive: "Interactive Challenge",
    "teach-back": "Teach It Back",
    retrieval: "Quick Recall Flashcards",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#0D0912] border border-white/15 shadow-2xl shadow-black relative"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#C084FC] font-bold px-2.5 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
            TRANSPARENT AI
          </span>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">
            ✕
          </button>
        </div>

        <h3 className="font-display text-2xl text-white font-bold mb-4">
          Why did Riff change the explanation?
        </h3>

        {/* Transition Bubble */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
          <div>
            <span className="block font-mono text-[10px] uppercase text-white/40">From Strategy</span>
            <span className="font-semibold text-sm text-white">{modalityNames[fromModality] || fromModality}</span>
          </div>
          <span className="text-[#C084FC] text-xl">➔</span>
          <div>
            <span className="block font-mono text-[10px] uppercase text-[#C084FC]">To Strategy</span>
            <span className="font-semibold text-sm text-[#47BFFF]">{modalityNames[toModality] || toModality}</span>
          </div>
        </div>

        {/* Observed Signals */}
        <div className="mb-4">
          <span className="block text-xs font-semibold uppercase font-mono text-white/70 mb-2">
            Riff noticed:
          </span>
          <ul className="space-y-1.5 pl-4 text-xs text-white/70 list-disc">
            {observedSignals.map((sig, i) => (
              <li key={i}>{sig}</li>
            ))}
          </ul>
        </div>

        {/* Pedagogical Rationale */}
        <div className="mb-6 p-4 rounded-xl bg-[#7C3AED]/15 border border-[#9F67FF]/30">
          <span className="block text-xs font-semibold text-[#C084FC] mb-1">
            💡 So Riff changed the teaching style:
          </span>
          <p className="text-xs text-white/90 leading-relaxed m-0">{reasonText}</p>
        </div>

        {/* Feedback buttons */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-white/50">Did this adaptation help you?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("helped");
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90"
            >
              👍 Yes, it helped
            </button>
            <button
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("somewhat");
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs"
            >
              👌 Somewhat
            </button>
            <button
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("not_really");
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 text-xs"
            >
              👎 Not really
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
