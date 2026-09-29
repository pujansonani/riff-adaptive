// DemoMode.jsx
// Interactive Judge Comparison Demo Mode:
// Showcases "Without Riff" (Standard Flat Learning) vs. "With Riff" (Adaptive Neuro-Learning Engine)

import { useState } from "react";

export default function DemoMode({ onRunAdaptiveDemo, isOpen, onClose }) {
  const [viewMode, setViewMode] = useState("comparison"); // 'comparison' | 'interactive'
  const [simStep, setSimStep] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="riff-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="demo-mode-title">
      <div className="riff-demo-card">
        <div className="riff-demo-header">
          <div>
            <div className="riff-hub-badge">HACKATHON DEMO & COMPARISON</div>
            <h2 id="demo-mode-title" className="riff-demo-title">
              Why Adaptive Neuro-Learning Matters
            </h2>
          </div>
          <button className="riff-btn-small dismiss" onClick={onClose}>
            ✕ Close Demo
          </button>
        </div>

        {/* View Switcher */}
        <div className="riff-demo-tabs">
          <button
            className={`riff-tab-btn ${viewMode === "comparison" ? "active" : ""}`}
            onClick={() => setViewMode("comparison")}
          >
            ⚖️ Side-by-Side Comparison
          </button>
          <button
            className={`riff-tab-btn ${viewMode === "interactive" ? "active" : ""}`}
            onClick={() => setViewMode("interactive")}
          >
            ▶ Interactive Loop Walkthrough
          </button>
        </div>

        {/* Tab 1: Side by Side Comparison */}
        {viewMode === "comparison" && (
          <div className="riff-demo-comparison-grid">
            {/* Standard Learning Card */}
            <div className="comparison-card standard">
              <div className="card-top">
                <span className="card-badge danger">WITHOUT RIFF (Standard)</span>
                <h4>Static, One-Size-Fits-All</h4>
              </div>

              <div className="comparison-step-list">
                <div className="comp-step">
                  <span className="step-bullet red">1</span>
                  <div>
                    <strong>Dense Explanation</strong>
                    <p>Student is handed an abstract, unpersonalized wall of text.</p>
                  </div>
                </div>

                <div className="comp-step">
                  <span className="step-bullet red">2</span>
                  <div>
                    <strong>Friction Ignored</strong>
                    <p>Student hesitates, deletes repeatedly, and stares at the screen. System remains passive.</p>
                  </div>
                </div>

                <div className="comp-step">
                  <span className="step-bullet red">3</span>
                  <div>
                    <strong>Binary Assessment</strong>
                    <p>Submits incorrect answer. System simply says "Wrong" with no misconception repair.</p>
                  </div>
                </div>

                <div className="comp-step">
                  <span className="step-bullet red">4</span>
                  <div>
                    <strong>Cognitive Fatigue & Abandonment</strong>
                    <p>Learner feels overwhelmed and disengages with zero long-term retention.</p>
                  </div>
                </div>
              </div>

              <div className="comp-outcome red">
                <span>Result: Low comprehension, high frustration</span>
              </div>
            </div>

            {/* Riff Adaptive Learning Card */}
            <div className="comparison-card adaptive">
              <div className="card-top">
                <span className="card-badge success">WITH RIFF (Adaptive Engine)</span>
                <h4>Continuous Observation & Modality Adaptation</h4>
              </div>

              <div className="comparison-step-list">
                <div className="comp-step">
                  <span className="step-bullet green">1</span>
                  <div>
                    <strong>Personalized Riffing</strong>
                    <p>Concept is reframed through student's passion (Minecraft, basketball, space).</p>
                  </div>
                </div>

                <div className="comp-step">
                  <span className="step-bullet green">2</span>
                  <div>
                    <strong>RiffSense Friction Detection</strong>
                    <p>Pacing z-scores and backspaces are monitored against their own baseline in real-time.</p>
                  </div>
                </div>

                <div className="comp-step">
                  <span className="step-bullet green">3</span>
                  <div>
                    <strong>RiffAdapt Strategy Shift</strong>
                    <p>Autopilot switches to RiffBoard visual diagram or one-step Focus Room before failure.</p>
                  </div>
                </div>

                <div className="comp-step">
                  <span className="step-bullet green">4</span>
                  <div>
                    <strong>Teach-Back & Spaced Retention</strong>
                    <p>Student teaches concept back to a buddy, and smart Leitner schedule locks in memory.</p>
                  </div>
                </div>
              </div>

              <div className="comp-outcome green">
                <span>Result: Conceptual mastery, 85%+ confidence, long-term retention</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Loop Walkthrough */}
        {viewMode === "interactive" && (
          <div className="riff-interactive-walkthrough">
            <div className="walkthrough-stepper">
              {[
                { num: 1, title: "1. OBSERVE", desc: "RiffSense tracks typing rhythm vs personal baseline" },
                { num: 2, title: "2. DETECT", desc: "ML classifier estimates friction state (e.g. Struggling)" },
                { num: 3, title: "3. ADAPT", desc: "RiffAdapt routes from text to visual diagram or micro-step" },
                { num: 4, title: "4. TEACH", desc: "RiffBoard renders structured schematic diagram" },
                { num: 5, title: "5. PRACTICE", desc: "Learner teaches it back in their own words" },
                { num: 6, title: "6. REMEMBER", desc: "Smart spaced repetition schedule locks concept in" },
              ].map((s, idx) => (
                <div
                  key={s.num}
                  className={`walkthrough-step-box ${simStep === idx ? "active" : simStep > idx ? "completed" : ""}`}
                  onClick={() => setSimStep(idx)}
                >
                  <span className="box-num">{s.num}</span>
                  <div className="box-info">
                    <strong>{s.title}</strong>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="walkthrough-action-bar">
              <button
                className="riff-btn-small accept"
                onClick={() => {
                  onClose();
                  if (onRunAdaptiveDemo) onRunAdaptiveDemo();
                }}
              >
                🚀 Run Live Adaptive Demonstration in App
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
