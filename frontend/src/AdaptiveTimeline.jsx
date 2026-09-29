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
    <div className="riff-timeline-container">
      <div className="riff-timeline-header">
        <div>
          <span className="riff-panel-label" style={{ margin: 0 }}>
            Today's Learning Journey
          </span>
          <p className="riff-timeline-subtitle">
            Real-time chronology of observations, cognitive adaptations, and retention milestones.
          </p>
        </div>
        {events.length > 0 && (
          <button className="riff-btn-small dismiss" onClick={onClearHistory} title="Start new timeline">
            Reset Journey
          </button>
        )}
      </div>

      <div className="riff-timeline-stream">
        {displayEvents.map((evt, idx) => {
          const isLast = idx === displayEvents.length - 1;
          const badgeClass =
            evt.type === "friction_detected"
              ? "friction"
              : evt.type === "adaptation_triggered"
              ? "adaptation"
              : evt.type === "understanding_checked"
              ? "understanding"
              : "default";

          return (
            <div key={evt.id || idx} className={`riff-timeline-item ${isLast ? "current" : ""}`}>
              <div className="timeline-node">
                <span className="node-icon">{evt.icon || "●"}</span>
                {!isLast && <div className="timeline-connector" />}
              </div>

              <div className="timeline-content">
                <div className="timeline-meta-row">
                  <span className="timeline-time">{evt.timeStr}</span>
                  {evt.badge && <span className={`timeline-badge ${badgeClass}`}>{evt.badge}</span>}
                </div>
                <div className="timeline-title">{evt.title}</div>
                {evt.detail && <div className="timeline-detail">{evt.detail}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
