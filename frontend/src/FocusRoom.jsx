// FocusRoom.jsx
// Friendly, calm Focus Room ("Let's make this smaller") for young learners.
// Distraction-free single-instruction card with audio narration, drawing button, and encouragement.

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
    <div className="fixed inset-0 z-50 bg-[#FFF9F0]/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
      {/* Top Bar */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#E8DEFF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8DEFF] flex items-center justify-center text-xl shadow-sm">
            🪜
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#263238]">
              Let's make this smaller.
            </h3>
            <span className="text-xs font-semibold text-[#546E7A]">
              Step {currentStepIdx + 1} of {totalSteps} tiny steps
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-white border-2 border-[#E8DEFF] hover:bg-[#FFF3D6] text-xs font-bold text-[#263238] transition-all shadow-sm"
        >
          Done for now ✕
        </button>
      </div>

      {/* Center Main Step Presentation */}
      <div className="max-w-2xl mx-auto w-full my-auto py-10 flex flex-col items-start">
        {/* Visual Step Progress Dots */}
        <div className="flex items-center gap-2 mb-8">
          {stepList.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentStepIdx
                  ? "bg-[#6C63FF] scale-125"
                  : i < currentStepIdx
                  ? "bg-[#2EC4B6]"
                  : "bg-[#E8DEFF]"
              }`}
            />
          ))}
        </div>

        {/* Current Instruction Box */}
        <motion.div
          key={currentStepIdx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#6C63FF] font-sans">
            Step {currentStepIdx + 1}
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#263238] leading-snug">
            {currentStepText}
          </h2>
          <span className="text-xs font-semibold text-[#546E7A] block pt-2">
            Take your time. Just this one thing!
          </span>
        </motion.div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-8">
          <button
            onClick={handleReadStep}
            className="px-5 py-3 rounded-full bg-white hover:bg-[#FFF3D6] border-2 border-[#E8DEFF] text-xs font-bold text-[#263238] transition-all flex items-center gap-2 shadow-sm"
          >
            <span>🔊</span> Hear it
          </button>

          <button
            onClick={() => {
              if (onSwitchModality) onSwitchModality("whiteboard");
            }}
            className="px-5 py-3 rounded-full bg-white hover:bg-[#FFF3D6] border-2 border-[#E8DEFF] text-xs font-bold text-[#263238] transition-all flex items-center gap-2 shadow-sm"
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
            className="px-7 py-3 rounded-full bg-[#6C63FF] hover:bg-[#534BD6] text-white font-bold text-xs transition-all shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            {currentStepIdx < totalSteps - 1 ? "I did this! Next step →" : "All steps finished! 🎉"}
          </button>

          <button
            onClick={() => {
              if (onImStuck) onImStuck({ stepIndex: currentStepIdx, stepText: currentStepText });
            }}
            className="px-5 py-3 rounded-full bg-[#FFE0E5] hover:bg-[#FFCCD5] text-[#FF5E7E] font-bold text-xs transition-all"
          >
            Hmm, I'm stuck 🤔
          </button>
        </div>
      </div>

      {/* Bottom Reassurance */}
      <div className="max-w-3xl mx-auto w-full pt-6 border-t border-[#E8DEFF] flex items-center justify-between text-xs text-[#546E7A]">
        <span>No timers. No pressure. One step at a time.</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))}
            disabled={currentStepIdx === 0}
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8DEFF] disabled:opacity-40 font-bold text-xs"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStepIdx(Math.min(totalSteps - 1, currentStepIdx + 1))}
            disabled={currentStepIdx === totalSteps - 1}
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8DEFF] disabled:opacity-40 font-bold text-xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
