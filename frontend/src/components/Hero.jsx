// Hero.jsx
// Warm, playful digital learning playground hero for kids & teens.
// Features floating illustrated stationery, welcoming typography, friendly Riff mascot, and cheerful CTAs.

import { motion } from "framer-motion";
import RiffMascot from "../Mascot.jsx";

export default function Hero({ onStartLearning, onExploreAdaptive }) {
  const floatingItems = [
    { emoji: "✏️", label: "Draw", top: "15%", left: "8%", delay: 0 },
    { emoji: "⭐", label: "Streak", top: "25%", right: "12%", delay: 1 },
    { emoji: "🪐", label: "Space", bottom: "25%", left: "10%", delay: 2 },
    { emoji: "📐", label: "Math", top: "65%", right: "8%", delay: 1.5 },
    { emoji: "💡", label: "Idea", top: "12%", right: "30%", delay: 0.5 },
  ];

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-between overflow-hidden pt-28 pb-12 px-6 sm:px-12 bg-[#FFF9F0]">
      {/* Background Subtle Gradient Blobs & Floating Learning Toys */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft Pastel Background Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FFE0E5] opacity-50 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-[#DCEBFF] opacity-50 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-[#DFF7F0] opacity-50 blur-3xl" />

        {/* Floating Items with Gentle Bobbing */}
        {floatingItems.map((item, i) => (
          <motion.div
            key={i}
            style={{ top: item.top, bottom: item.bottom, left: item.left, right: item.right }}
            animate={{ y: [0, -12, 0], rotate: [0, 6, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4 + i, delay: item.delay, ease: "easeInOut" }}
            className="hidden md:flex absolute items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E8DEFF] shadow-card"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[11px] font-bold text-[#546E7A]">{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 my-auto py-8">
        {/* Left Column: Expressive Headline & CTAs */}
        <div className="max-w-2xl flex flex-col items-start text-left">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8DEFF] border border-[#6C63FF]/20 mb-6 shadow-sm"
          >
            <span className="text-sm">✦</span>
            <span className="text-xs font-bold font-sans tracking-wide text-[#534BD6] uppercase">
              YOUR LEARNING BUDDY
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#263238] leading-[1.08] mb-6"
          >
            Learning <br />
            That Moves{" "}
            <span className="font-hand font-bold text-[#6C63FF] text-6xl sm:text-7xl lg:text-8xl inline-block transform -rotate-2">
              With You.
            </span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-[#546E7A] font-medium leading-relaxed max-w-lg mb-8"
          >
            Riff notices when learning gets difficult and changes the way it helps — so you can keep going and feel proud!
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mb-10"
          >
            <button
              onClick={onStartLearning}
              className="px-8 py-4 rounded-full bg-[#6C63FF] hover:bg-[#534BD6] text-white font-bold text-sm tracking-wide transition-all shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none flex items-center gap-2"
            >
              <span>Start Learning</span>
              <span>→</span>
            </button>

            <button
              onClick={onExploreAdaptive}
              className="px-6 py-4 rounded-full bg-white hover:bg-[#FFF3D6] text-[#263238] font-bold text-sm border-2 border-[#E8DEFF] hover:border-[#FFB84D] transition-all shadow-sm"
            >
              See How Riff Works ✨
            </button>
          </motion.div>

          {/* Cheerful Friendly Learning Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 w-full max-w-md"
          >
            <div className="p-4 rounded-3xl bg-white border border-[#DFF7F0] shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DFF7F0] flex items-center justify-center text-xl">
                🎨
              </div>
              <div>
                <span className="font-display font-bold text-sm text-[#263238] block">Visual & Fun</span>
                <span className="text-xs text-[#546E7A]">Draw & explore ideas</span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#DCEBFF] shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCEBFF] flex items-center justify-center text-xl">
                🪜
              </div>
              <div>
                <span className="font-display font-bold text-sm text-[#263238] block">Tiny Steps</span>
                <span className="text-xs text-[#546E7A]">No pressure ever</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Friendly Interactive Character Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-[40px] bg-gradient-to-b from-white to-[#FFF3D6]/60 border-2 border-[#E8DEFF] shadow-xl max-w-sm w-full"
        >
          {/* Decorative Corner Badges */}
          <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-[#FF5E7E] text-white text-[11px] font-bold shadow-md transform rotate-6">
            Always friendly!
          </div>

          <RiffMascot size="hero" mood="calm" message="Hey! What are we learning today?" />

          <div className="mt-6 text-center space-y-1">
            <h3 className="font-display text-xl font-bold text-[#263238]">
              Meet Riff, Your Buddy
            </h3>
            <p className="text-xs text-[#546E7A] leading-relaxed">
              Whenever a problem feels tricky, Riff suggests pictures, stories, or smaller steps.
            </p>
          </div>

          {/* Quick Mood/Strategy Preview Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
            <span className="px-2.5 py-1 rounded-full bg-[#DFF7F0] text-[#20A396] text-[11px] font-bold">
              🌱 No rush
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#E8DEFF] text-[#534BD6] text-[11px] font-bold">
              ✨ 3 Ways to explain
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFF3D6] text-[#E08A00] text-[11px] font-bold">
              🎯 Your pace
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Subtle Learning Strip */}
      <div className="relative z-10 max-w-6xl mx-auto w-full pt-6 border-t border-[#E8DEFF] flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#546E7A]">
        <div className="flex items-center gap-2">
          <span>🌟</span>
          <span>Made for young thinkers who learn differently.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#6C63FF]">● Visuals</span>
          <span className="text-[#2EC4B6]">● Voice</span>
          <span className="text-[#FFB84D]">● Tiny Steps</span>
          <span className="text-[#FF5E7E]">● Fun Stories</span>
        </div>
      </div>
    </section>
  );
}
