// FocusSupportModal.jsx
// Riffocus: Adaptive Focus Support Mode.
// De-clutters the learning interface into bite-sized micro-steps with single-instruction focus.

import { useState } from "react";

export default function FocusSupportModal({
  isOpen,
  onClose,
  lesson,
  interest,
  steps = [],
  onSwitchModality,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  if (!isOpen) return null;

  // Split steps or fallback to sentences if not already array
  const stepList = Array.isArray(steps) && steps.length > 0
    ? steps
    : typeof steps === "string" && steps.trim()
    ? steps.split(/\n+/).filter((s) => s.trim().length > 0)
    : [
        `Identify the core question in ${interest || "the topic"}.`,
        "Write down what you already know in one short phrase.",
        "Connect it to the new concept step-by-step.",
        "Check your understanding with one quick sentence.",
      ];

  const currentStep = stepList[currentStepIndex] || stepList[0];
  const progressPct = Math.round(((completedSteps.size) / stepList.length) * 100);

  const handleNextStep = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStepIndex]));
    if (currentStepIndex < stepList.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="riff-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="focus-modal-title">
      <div className="riff-focus-card">
        <div className="riff-focus-header">
          <div>
            <span className="riff-panel-label" id="focus-modal-title">
              Riffocus — One Step at a Time
            </span>
            <p className="riff-focus-subtitle">
              Let's make this easier. Focus only on this single micro-step.
            </p>
          </div>
          <button className="riff-btn-small dismiss" onClick={onClose} aria-label="Close Focus Mode">
            ✕ Exit Focus
          </button>
        </div>

        {/* Progress bar */}
        <div className="riff-focus-progress-wrap">
          <div className="riff-focus-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="riff-focus-step-indicator">
          Step {currentStepIndex + 1} of {stepList.length} • {progressPct}% done
        </div>

        {/* The single micro-step card */}
        <div className="riff-focus-main-step">
          <div className="riff-focus-step-badge">{currentStepIndex + 1}</div>
          <div className="riff-focus-step-text">{currentStep}</div>
        </div>

        {/* Action Controls */}
        <div className="riff-focus-actions">
          <button
            className="riff-btn-small ghost"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
          >
            ← Previous Step
          </button>

          {currentStepIndex < stepList.length - 1 ? (
            <button className="riff-btn-small accept" onClick={handleNextStep}>
              ✓ Got this step, Next →
            </button>
          ) : (
            <button className="riff-btn-small accept" onClick={onClose}>
              🎉 All steps complete! Return to lesson
            </button>
          )}
        </div>

        {/* Switch Modality Alternative Nudge */}
        <div className="riff-focus-footer">
          <span>Still feeling friction?</span>
          <div className="riff-focus-modality-links">
            <button
              className="riff-link-btn"
              onClick={() => {
                onClose();
                onSwitchModality("whiteboard");
              }}
            >
              🎨 Sketch on Whiteboard
            </button>
            <button
              className="riff-link-btn"
              onClick={() => {
                onClose();
                onSwitchModality("audio");
              }}
            >
              🔊 Listen to Audio
            </button>
            <button
              className="riff-link-btn"
              onClick={() => {
                onClose();
                onSwitchModality("bridge");
              }}
            >
              🌉 Concept Bridge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
