// ConfidenceJourney.jsx
// Visual learning confidence graph tracking comprehension progression across session milestones.

export default function ConfidenceJourney({ points = [] }) {
  const displayPoints = points.length > 0 ? points : [
    { id: "p1", label: "Start", confidence: 0.35, percentage: 35 },
    { id: "p2", label: "Riffed", confidence: 0.55, percentage: 55 },
  ];

  const maxConf = 100;
  const currentConfidence = displayPoints[displayPoints.length - 1]?.percentage || 50;

  return (
    <div className="riff-confidence-journey-card">
      <div className="riff-cj-header">
        <div>
          <span className="riff-panel-label" style={{ margin: 0 }}>
            Learning Confidence Progression
          </span>
          <p className="riff-cj-subtitle">
            How your conceptual grasp evolves through interactive practice and adaptations.
          </p>
        </div>
        <div className="riff-cj-current-pill">
          <span className="cj-pill-val">{currentConfidence}%</span>
          <span className="cj-pill-lbl">Current Level</span>
        </div>
      </div>

      {/* Visual Line / Bar Graph */}
      <div className="riff-cj-graph-wrap">
        <div className="cj-y-axis">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        <div className="cj-plot-area">
          {/* Grid lines */}
          <div className="cj-grid-line" style={{ bottom: "100%" }} />
          <div className="cj-grid-line" style={{ bottom: "75%" }} />
          <div className="cj-grid-line" style={{ bottom: "50%" }} />
          <div className="cj-grid-line" style={{ bottom: "25%" }} />

          {/* Points & Connectors */}
          <div className="cj-points-row">
            {displayPoints.map((pt, idx) => {
              const heightPct = Math.min(100, Math.max(10, pt.percentage));
              const isLatest = idx === displayPoints.length - 1;

              return (
                <div key={pt.id || idx} className="cj-point-col">
                  <div className="cj-bar-track">
                    <div
                      className={`cj-bar-fill ${isLatest ? "latest" : ""}`}
                      style={{ height: `${heightPct}%` }}
                    >
                      <span className="cj-bar-label">{pt.percentage}%</span>
                    </div>
                  </div>
                  <span className="cj-x-label">{pt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="riff-cj-footer">
        <span>*Learning confidence measures conceptual clarity and answer alignment — not fixed capability.</span>
      </div>
    </div>
  );
}
