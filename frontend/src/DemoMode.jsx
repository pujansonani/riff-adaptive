// DemoMode.jsx
// Interactive Judge Comparison Demo Mode.

import { useState } from "react";
import { motion } from "framer-motion";

export default function DemoMode({ onRunAdaptiveDemo, isOpen, onClose }) {
  const [viewMode, setViewMode] = useState("comparison");
  const [simStep, setSimStep] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl p-6 sm:p-8 rounded-3xl bg-[#0c0c10] border border-white/15 shadow-2xl shadow-black relative max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-400 font-bold px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30">
            HACKATHON DEMO & COMPARISON
          </span>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">
            ✕
          </button>
        </div>

        <h2 className="font-serif text-3xl text-white font-normal mb-6">
          Why Adaptive Neuro-Learning Matters
        </h2>

        {/* View Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-3 mb-6">
          <button
            onClick={() => setViewMode("comparison")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              viewMode === "comparison"
                ? "bg-white text-black"
                : "bg-white/5 hover:bg-white/10 text-white/70"
            }`}
          >
            ⚖️ Side-by-Side Comparison
          </button>
          <button
            onClick={() => setViewMode("interactive")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              viewMode === "interactive"
                ? "bg-white text-black"
                : "bg-white/5 hover:bg-white/10 text-white/70"
            }`}
          >
            ▶ Adaptive Loop Walkthrough
          </button>
        </div>

        {/* Tab 1: Comparison */}
        {viewMode === "comparison" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Learning Card */}
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-rose-300 font-bold block mb-1">
                  WITHOUT RIFF (Standard)
                </span>
                <h4 className="font-serif text-xl text-white font-normal mb-4">Static & One-Size-Fits-All</h4>

                <div className="space-y-3 mb-6">
                  <div className="flex gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold shrink-0">1</span>
                    <div>
                      <strong className="text-white">Dense Unadapted Text</strong>
                      <p className="text-white/60 m-0">Student is given abstract, uniform text.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold shrink-0">2</span>
                    <div>
                      <strong className="text-white">Friction Ignored</strong>
                      <p className="text-white/60 m-0">Student hesitates and deletes. Passive system does nothing.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold shrink-0">3</span>
                    <div>
                      <strong className="text-white">Binary "Wrong" Outcome</strong>
                      <p className="text-white/60 m-0">Zero misconception diagnosis or pedagogical repair.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium text-center">
                Outcome: Frustration & Cognitive Fatigue
              </div>
            </div>

            {/* Riff Adaptive Card */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                  WITH RIFF (Adaptive Engine)
                </span>
                <h4 className="font-serif text-xl text-white font-normal mb-4">Continuous Real-Time Adaptation</h4>

                <div className="space-y-3 mb-6">
                  <div className="flex gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold shrink-0">1</span>
                    <div>
                      <strong className="text-white">Personalized Riffing</strong>
                      <p className="text-white/60 m-0">Lesson reshaped through personal passion.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold shrink-0">2</span>
                    <div>
                      <strong className="text-white">RiffSense Behavioral ML</strong>
                      <p className="text-white/60 m-0">Monitors pacing z-scores vs student's personal baseline.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold shrink-0">3</span>
                    <div>
                      <strong className="text-white">Strategy Shift & Spaced Retention</strong>
                      <p className="text-white/60 m-0">Switches to visual canvas, teach-back, and spaced review.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium text-center">
                Outcome: Conceptual Mastery & 85%+ Confidence
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Walkthrough */}
        {viewMode === "interactive" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { num: 1, title: "1. OBSERVE", desc: "RiffSense tracks typing rhythm vs personal baseline" },
                { num: 2, title: "2. DETECT", desc: "ML classifier estimates friction state (e.g. Struggling)" },
                { num: 3, title: "3. ADAPT", desc: "RiffAdapt routes to visual diagram or micro-steps" },
                { num: 4, title: "4. TEACH", desc: "RiffBoard renders structured concept model" },
                { num: 5, title: "5. PRACTICE", desc: "Learner teaches it back in their own words" },
                { num: 6, title: "6. REMEMBER", desc: "Smart spaced repetition schedule locks concept in" },
              ].map((s, idx) => (
                <div
                  key={s.num}
                  onClick={() => setSimStep(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    simStep === idx
                      ? "bg-indigo-500/20 border-indigo-400 text-white"
                      : "bg-white/[0.03] border-white/10 text-white/70"
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold text-indigo-400">STAGE {s.num}</span>
                  <strong className="block text-xs font-semibold text-white mt-1">{s.title}</strong>
                  <p className="text-[11px] text-white/50 m-0 mt-1 leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  onClose();
                  if (onRunAdaptiveDemo) onRunAdaptiveDemo();
                }}
                className="px-8 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 shadow-xl shadow-white/10"
              >
                🚀 Run Live Adaptive Demonstration in App
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
