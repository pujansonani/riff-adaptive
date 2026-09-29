// FocusRoom.jsx
// Riff Focus Room: Fullscreen, distraction-free single-task focus environment.

import { useState, useEffect } from "react";
import { isSpeechSupported, speak, stopSpeaking } from "./speech";
import { motion } from "framer-motion";

export default function FocusRoom({
  isOpen,
  onClose,
  lesson = "",
  interest = "",
  steps = [],
  onImStuck,
  onSwitchModality,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isNarrating, setIsNarrating] = useState(false);

  const stepList = Array.isArray(steps) && steps.length > 0
    ? steps
    : typeof steps === "string" && steps.trim()
    ? steps.split(/\n+/).filter((s) => s.trim().length > 0)
    : [
        `Identify the core question in ${interest || "the concept"}.`,
        "Write down what you already know in one simple phrase.",
        "Notice the relationship between the parts and whole.",
        "Apply the concept to a real-world example.",
      ];

  const currentStep = stepList[currentStepIndex] || stepList[0];
  const progressPct = Math.round(((currentStepIndex + 1) / stepList.length) * 100);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        stopSpeaking();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleHearStep = () => {
    if (isNarrating) {
      stopSpeaking();
      setIsNarrating(false);
      return;
    }
    setIsNarrating(true);
    speak(currentStep, () => setIsNarrating(false));
  };

  const handleUnderstandStep = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStepIndex]));
    if (currentStepIndex < stepList.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      stopSpeaking();
      onClose();
    }
  };

  const handleStuckClick = () => {
    stopSpeaking();
    if (onImStuck) {
      onImStuck({ stepIndex: currentStepIndex, stepText: currentStep });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/90 backdrop-blur-2xl flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl p-8 rounded-3xl bg-[#0c0c10] border border-white/15 shadow-2xl shadow-black relative flex flex-col justify-between min-h-[460px]"
      >
        {/* Top bar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-400 font-bold px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              RIFF FOCUS ROOM
            </span>
            <span className="font-mono text-xs text-white/50">
              Step {currentStepIndex + 1} of {stepList.length}
            </span>
            <button
              onClick={onClose}
              className="text-xs text-white/40 hover:text-white px-3 py-1 rounded-full bg-white/[0.05]"
            >
              Exit (Esc)
            </button>
          </div>

          {/* Progress track */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Micro-Step Card */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
            <span className="font-mono text-xs text-indigo-400 font-bold block mb-2">
              STEP {currentStepIndex + 1}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-snug mb-6">
              {currentStep}
            </h2>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleHearStep}
                disabled={!isSpeechSupported()}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isNarrating
                    ? "bg-rose-500 text-white border-rose-400"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
                }`}
              >
                {isNarrating ? "⏹ Stop Audio" : "🔊 Hear It"}
              </button>
              <button
                onClick={() => {
                  stopSpeaking();
                  onClose();
                  onSwitchModality("whiteboard");
                }}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
              >
                🎨 Draw It on Canvas
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div>
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
            <button
              onClick={handleStuckClick}
              className="px-5 py-2.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
            >
              🤔 I'm stuck on this
            </button>
            <button
              onClick={handleUnderstandStep}
              className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 shadow-xl shadow-white/10 transition-all active:scale-95"
            >
              {currentStepIndex < stepList.length - 1 ? "✓ I understand, next step →" : "🎉 Complete & return"}
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] text-white/30 font-mono mt-3">
            <span>{progressPct}% completed</span>
            <span>Tip: Take it one step at a time.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
