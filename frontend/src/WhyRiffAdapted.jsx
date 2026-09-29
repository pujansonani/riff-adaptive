// WhyRiffAdapted.jsx
// Explainability layer for Riff Autopilot:
// Shows the learner exactly which real behavioral signals were observed
// and why a specific adaptation was chosen.

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
    "micro-step": "Micro-Step Mode",
    analogy: "Concept Bridge (Analogy)",
    audio: "Audio Read Aloud",
    interactive: "Interactive Challenge",
    "teach-back": "Teach It Back",
    retrieval: "Quick Recall Flashcards",
  };

  return (
    <div className="riff-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="why-adapted-title">
      <div className="riff-explain-card">
        <div className="riff-explain-header">
          <div className="riff-hub-badge">EXPLAINABLE ADAPTIVE AI</div>
          <h3 id="why-adapted-title" className="riff-explain-title">
            Why Riff Changed Its Teaching Strategy
          </h3>
        </div>

        <div className="riff-explain-transition-row">
          <div className="modality-bubble from">
            <span className="bubble-lbl">Previous Strategy</span>
            <span className="bubble-name">{modalityNames[fromModality] || fromModality}</span>
          </div>
          <div className="transition-arrow">➔</div>
          <div className="modality-bubble to">
            <span className="bubble-lbl">Adapted Strategy</span>
            <span className="bubble-name">{modalityNames[toModality] || toModality}</span>
          </div>
        </div>

        {/* Signals Observed */}
        <div className="riff-explain-section">
          <span className="explain-section-title">🔍 Real Signals Riff Observed:</span>
          <ul className="explain-signals-list">
            {observedSignals.map((sig, i) => (
              <li key={i}>{sig}</li>
            ))}
          </ul>
        </div>

        {/* Reasoning */}
        <div className="riff-explain-section">
          <span className="explain-section-title">💡 Pedagogical Rationale:</span>
          <p className="explain-reason-text">{reasonText}</p>
        </div>

        {/* Feedback to close loop */}
        <div className="riff-explain-feedback">
          <span>Did this adaptation help your understanding?</span>
          <div className="feedback-btn-group">
            <button
              className="riff-btn-small accept"
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("helped");
                onClose();
              }}
            >
              👍 Yes, it helped
            </button>
            <button
              className="riff-btn-small ghost"
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("somewhat");
                onClose();
              }}
            >
              👌 Somewhat
            </button>
            <button
              className="riff-btn-small dismiss"
              onClick={() => {
                if (onProvideFeedback) onProvideFeedback("not_really");
                onClose();
              }}
            >
              👎 Not really
            </button>
          </div>
        </div>

        <div className="riff-explain-actions">
          <button className="riff-btn-small dismiss" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
