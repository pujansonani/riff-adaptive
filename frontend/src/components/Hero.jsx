// Hero.jsx
// Full-screen cinematic dark video hero inspired by Orchid aesthetic,
// tailored specifically for Riff's Adaptive Neuro-Learning product.

import { motion } from "framer-motion";

export default function Hero({ onStartLearning, onExploreAdaptive, onSelectFeature }) {
  const featureStrip = [
    {
      num: "01",
      name: "RiffSense",
      icon: "◉",
      desc: "ML-based pacing & friction observation vs personal baseline",
    },
    {
      num: "02",
      name: "RiffAdapt",
      icon: "✦",
      desc: "Autopilot strategy shifts: visual canvas, micro-steps, analogy",
    },
    {
      num: "03",
      name: "RiffRecall",
      icon: "◇",
      desc: "Smart spaced retrieval (5m → 1d → 3d → 7d → 14d) retention",
    },
    {
      num: "04",
      name: "RiffFocus",
      icon: "↻",
      desc: "Immersive, single-instruction focus room with audio narration",
    },
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden pt-28 pb-12 px-6 sm:px-12 bg-[#050505]">
      {/* Background Cinematic Video */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-35 scale-105"
        />
        {/* Multilayer Dark Radial & Linear Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.7)_100%)]" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-start justify-center flex-1 my-auto py-12">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md mb-6 shadow-inner shadow-white/5"
        >
          <span className="text-indigo-400 text-xs">✦</span>
          <span className="text-[11px] font-mono tracking-widest uppercase text-white/90 font-semibold">
            ADAPTIVE NEURO-LEARNING ENGINE
          </span>
        </motion.div>

        {/* Serif Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.08] mb-6 max-w-4xl"
        >
          Learning That <br className="hidden sm:inline" />
          <span className="italic font-normal bg-gradient-to-r from-white via-white/95 to-white/70 bg-clip-text text-transparent">
            Changes With You.
          </span>
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-base sm:text-lg lg:text-xl text-white/70 font-light leading-relaxed max-w-2xl mb-10"
        >
          Riff doesn’t wait for a learner to fail. It observes how you interact in real-time,
          understands when something isn't working, and dynamically shifts how it teaches.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap items-center gap-4"
        >
          <button
            onClick={onStartLearning}
            className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/10 hover:shadow-white/20 active:scale-95 flex items-center gap-2 group"
          >
            <span>Start Learning</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>

          <button
            onClick={onExploreAdaptive}
            className="px-7 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-medium text-sm transition-all duration-300 backdrop-blur-md"
          >
            See Riff Adapt ⚡
          </button>
        </motion.div>
      </div>

      {/* Hero Feature Strip (Bottom 4 Frosted-Glass Cards) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
      >
        {featureStrip.map((item, idx) => (
          <div
            key={item.name}
            onClick={() => onSelectFeature && onSelectFeature(item.name.toLowerCase())}
            className="group p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg shadow-black/40 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-indigo-400 text-base">{item.icon}</span>
              <span className="font-mono text-[10px] text-white/30 tracking-widest">{item.num}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                {item.name}
              </h3>
              <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
