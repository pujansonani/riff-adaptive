// Hero.jsx
// Fluxora-inspired cinematic hero for RIFF — Adaptive Neuro-Learning Engine.
// Fullscreen /hero-loop.mp4 video, oversized display typography with Instrument Serif italic accent,
// gradient CTA, overlapping proof dots, real telemetry glass stat cards, ghost analytics panel,
// subtle vertical guide lines, and watermark capability footer strip.

import { motion } from "framer-motion";

export default function Hero({
  onStartLearning,
  onExploreAdaptive,
  understandingConfidence = null,
  retentionDueCount = 0,
  behaviorState = {},
  currentModality = "text",
}) {
  const understandingPct = understandingConfidence !== null
    ? `${Math.round(understandingConfidence * 100)}%`
    : "—";

  const understandingSub = understandingConfidence !== null
    ? "Learning Confidence"
    : "Building baseline";

  const signals = [
    { label: "Typing Cadence", pct: 85, color: "#9F67FF" },
    { label: "Focus Rhythm", pct: 70, color: "#47BFFF" },
    { label: "Comprehension", pct: understandingConfidence !== null ? Math.round(understandingConfidence * 100) : 60, color: "#C084FC" },
    { label: "Recall Strength", pct: 75, color: "#10B981" },
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden pt-28 pb-10 px-6 sm:px-12 bg-[#07050B]">
      {/* 1. Subtle Vertical Guide Lines (Fluxora characteristic) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex justify-between max-w-7xl mx-auto px-6 opacity-30">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent hidden sm:block" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent hidden md:block" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* 2. Fullscreen Background Video (/hero-loop.mp4) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          src="/hero-loop.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-40 scale-105"
        />
        {/* Multilayer Dark Ember/Purple Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07050B] via-[#07050B]/50 to-[#07050B]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,5,11,0.8)_100%)]" />
      </div>

      {/* 3. Hero Main Content Grid */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 my-auto py-10">
        {/* Left / Main Column */}
        <div className="max-w-3xl flex flex-col items-start">
          {/* Eyebrow with horizontal rule */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#9F67FF]" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#C084FC] font-semibold">
              ✦ ADAPTIVE NEURO-LEARNING ENGINE
            </span>
          </motion.div>

          {/* Oversized Headline with Instrument Serif Italic Accent */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.04] mb-6"
          >
            Learning That <br />
            Adapts{" "}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E9D5FF] to-[#C084FC]">
              To You.
            </span>
          </motion.h1>

          {/* Supporting Description (2-3 lines) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-white/70 font-light leading-relaxed max-w-xl mb-8"
          >
            Riff observes how you learn, detects when the current approach isn’t working,
            and changes the way it teaches — in real time.
          </motion.p>

          {/* CTA & Proof Strip Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12"
          >
            {/* Fluxora-style Rounded Gradient CTA */}
            <button
              onClick={onStartLearning}
              className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C084FC] hover:from-[#8B5CF6] hover:to-[#D8B4FE] text-white font-semibold text-sm transition-all duration-300 shadow-xl shadow-[#7C3AED]/25 hover:shadow-[#7C3AED]/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3"
            >
              <span>Start Learning</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>

            {/* Overlapping Modality Proof Indicators */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-[#7C3AED]/80 border-2 border-[#07050B] flex items-center justify-center text-[10px] text-white shadow" title="Visual Mode">🎨</span>
                <span className="w-8 h-8 rounded-full bg-[#47BFFF]/80 border-2 border-[#07050B] flex items-center justify-center text-[10px] text-white shadow" title="Audio Mode">🔊</span>
                <span className="w-8 h-8 rounded-full bg-[#C084FC]/80 border-2 border-[#07050B] flex items-center justify-center text-[10px] text-white shadow" title="Text Mode">📄</span>
                <span className="w-8 h-8 rounded-full bg-[#10B981]/80 border-2 border-[#07050B] flex items-center justify-center text-[10px] text-white shadow" title="Spaced Recall">🗂️</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Learning differently</span>
                <span className="text-[11px] text-white/50">Every learner has a different path</span>
              </div>
            </div>
          </motion.div>

          {/* 2 Glassmorphism Real Stat Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 w-full max-w-md"
          >
            {/* Card 1: Real Understanding State */}
            <div className="p-5 rounded-2xl bg-white/[0.055] border border-white/[0.12] backdrop-blur-xl shadow-lg shadow-black/50">
              <span className="block font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {understandingPct}
              </span>
              <span className="text-xs font-mono text-white/60 mt-1 block">
                {understandingSub}
              </span>
            </div>

            {/* Card 2: Retention Queue */}
            <div className="p-5 rounded-2xl bg-white/[0.055] border border-white/[0.12] backdrop-blur-xl shadow-lg shadow-black/50">
              <span className="block font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {retentionDueCount}
              </span>
              <span className="text-xs font-mono text-white/60 mt-1 block">
                Reviews Due
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Ghost Analytics Visualization (≥1120px display) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden xl:flex flex-col w-80 p-6 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-2xl opacity-50 hover:opacity-90 transition-opacity duration-300 pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C084FC] font-semibold">
              ADAPTIVE SIGNALS
            </span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          </div>

          {/* Telemetry Progress Bars */}
          <div className="space-y-3 mb-6">
            {signals.map((sig) => (
              <div key={sig.label}>
                <div className="flex justify-between text-[11px] font-mono text-white/60 mb-1">
                  <span>{sig.label}</span>
                  <span>{sig.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${sig.pct}%`, backgroundColor: sig.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08]">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span className="text-[#10B981] font-mono">+18%</span> Learning confidence
            </span>
            <span className="text-[11px] text-white/40 block mt-1">
              Riff is learning what works.
            </span>
          </div>
        </motion.div>
      </div>

      {/* 4. Large Low-Opacity Watermark & Capability Strip */}
      <div className="relative z-20 max-w-7xl mx-auto w-full pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
        {/* Low Opacity Watermark */}
        <div className="font-display font-black text-4xl sm:text-5xl text-white/[0.08] tracking-widest select-none pointer-events-none">
          RIFF
        </div>

        {/* Capability Partner-Style Wordmark Strip */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-white/40 font-mono">
          <span className="text-white/20 uppercase tracking-widest text-[10px]">Riff learns through:</span>
          <span className="hover:text-white transition-colors cursor-default">RiffSense</span>
          <span className="text-white/20">•</span>
          <span className="hover:text-white transition-colors cursor-default">RiffAdapt</span>
          <span className="text-white/20">•</span>
          <span className="hover:text-white transition-colors cursor-default">RiffFocus</span>
          <span className="text-white/20">•</span>
          <span className="hover:text-white transition-colors cursor-default">RiffRecall</span>
          <span className="text-white/20">•</span>
          <span className="hover:text-white transition-colors cursor-default">Neuro-Read</span>
        </div>
      </div>
    </section>
  );
}
