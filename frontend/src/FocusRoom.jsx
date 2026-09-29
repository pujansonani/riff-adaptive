// FocusRoom.jsx
// Riff Focus Room: An immersive, de-cluttered single-task focus environment.
// Features micro-step sequencing, audio narration, whiteboard shortcut, and feedback controls.

import { useState, useEffect } from "react";
import { isSpeechSupported, speak, stopSpeaking } from "./speech";

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

  // Parse steps list
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

  // Keyboard accessibility: Escape to exit
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
    <div className="riff-focus-room-overlay" role="dialog" aria-modal="true" aria-labelledby="focus-room-title">
      <div className="riff-focus-room-card">
        {/* Top bar */}
        <div className="focus-room-topbar">
          <div className="focus-room-badge">
            <span className="dot pulse" /> RIFF FOCUS ROOM
          </div>
          <span className="focus-step-count">
            Step {currentStepIndex + 1} of {stepList.length}
          </span>
          <button className="riff-btn-small dismiss" onClick={onClose} title="Press Escape to exit">
            ✕ Exit (Esc)
          </button>
        </div>

        {/* Progress indicator */}
        <div className="focus-progress-track">
          <div className="focus-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* The single micro-step card */}
        <div className="focus-card-body">
          <div className="focus-step-number-pill">STEP {currentStepIndex + 1}</div>
          <h2 id="focus-room-title" className="focus-step-heading">
            {currentStep}
          </h2>

          <div className="focus-multimodal-shortcuts">
            <button
              className={`riff-btn-small ${isNarrating ? "accept" : "ghost"}`}
              onClick={handleHearStep}
              disabled={!isSpeechSupported()}
            >
              {isNarrating ? "⏹ Stop Audio" : "🔊 Hear It"}
            </button>
            <button
              className="riff-btn-small ghost"
              onClick={() => {
                stopSpeaking();
                onClose();
                onSwitchModality("whiteboard");
              }}
            >
              🎨 Draw It on Canvas
            </button>
            <button
              className="riff-btn-small ghost"
              onClick={() => {
                stopSpeaking();
                onClose();
                onSwitchModality("bridge");
              }}
            >
              🌉 Concept Bridge
            </button>
          </div>
        </div>

        {/* Main Response Actions */}
        <div className="focus-room-actions">
          <button className="focus-btn-stuck" onClick={handleStuckClick}>
            🤔 I'm stuck on this
          </button>
          <button className="focus-btn-understand" onClick={handleUnderstandStep}>
            {currentStepIndex < stepList.length - 1 ? "✓ I understand, next step →" : "🎉 Complete & return to lesson"}
          </button>
        </div>

        <div className="focus-room-footer">
          <span>{progressPct}% of micro-steps completed</span>
          <span>Tip: Focus solely on the step above without rushing.</span>
        </div>
      </div>
    </div>
  );
}
