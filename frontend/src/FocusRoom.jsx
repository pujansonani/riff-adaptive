// FocusRoom.jsx
// Immersive, de-cluttered single-instruction focus room with large typography and rescue shortcuts.

import { useState } from "react";
import { motion } from "framer-motion";
import { speak, isSpeechSupported } from "./speech.js";

export default function FocusRoom({
  isOpen,
  onClose,
  lesson = "",
  interest = "",
  steps = "",
  onImStuck,
  onSwitchModality,
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  // Split steps text into clean array
  const stepList = steps
    ? steps
        .split(/\n+/)
        .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter(Boolean)
    : [
        `Understand the core concept of ${interest || "the problem"}.`,
        "Identify how each part connects together.",
        "Solve the primary step and test your intuition.",
      ];

  const currentStepText = stepList[currentStepIdx] || stepList[0];
  const totalSteps = stepList.length;

  const handleReadStep = () => {
    if (isSpeechSupported()) {
      speak(currentStepText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07050B]/95 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C084FC] font-bold px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#9F67FF]/30">
            RIFF FOCUS ROOM
          </span>
          <span className="text-xs font-mono text-white/50">
            Step {currentStepIdx + 1} of {totalSteps}
          </span>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all"
        >
          Exit Focus ✕
        </button>
      </div>

      {/* Center Main Step Presentation with huge typography */}
      <div className="max-w-3xl mx-auto w-full my-auto py-12 flex flex-col items-start">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mb-10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#47BFFF] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIdx + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <motion.div
          key={currentStepIdx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 w-full"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-white/40">
            Current Micro-Step
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-white leading-snug">
            {currentStepText}
          </h2>
        </motion.div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-12">
          <button
            onClick={handleReadStep}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white border border-white/15 transition-all flex items-center gap-2"
          >
            <span>🔊</span> Hear it
          </button>

          <button
            onClick={() => {
              if (onSwitchModality) onSwitchModality("whiteboard");
            }}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white border border-white/15 transition-all flex items-center gap-2"
          >
            <span>🎨</span> Draw it
          </button>

          <button
            onClick={() => {
              if (currentStepIdx < totalSteps - 1) {
                setCurrentStepIdx(currentStepIdx + 1);
              } else {
                onClose();
              }
            }}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all shadow-lg"
          >
            {currentStepIdx < totalSteps - 1 ? "I understand → Next Step" : "Complete Step Room ✓"}
          </button>

          <button
            onClick={() => {
              if (onImStuck) onImStuck({ stepIndex: currentStepIdx, stepText: currentStepText });
            }}
            className="px-5 py-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 text-xs font-semibold transition-all"
          >
            ⚠️ I'm stuck
          </button>
        </div>
      </div>

      {/* Bottom Step Indicator */}
      <div className="max-w-4xl mx-auto w-full pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
        <span>Single-instruction focus view eliminates distraction and cognitive overwhelm.</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))}
            disabled={currentStepIdx === 0}
            className="px-3 py-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStepIdx(Math.min(totalSteps - 1, currentStepIdx + 1))}
            disabled={currentStepIdx === totalSteps - 1}
            className="px-3 py-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
