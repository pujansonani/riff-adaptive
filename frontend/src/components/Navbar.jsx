// Navbar.jsx
// Fixed frosted-glass navigation bar with Riff adaptive logo and responsive mobile drawer.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ onNavigate, activeSection, onOpenNeuroRead }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "learn", label: "Learn" },
    { id: "adaptive-engine", label: "Adaptive Engine" },
    { id: "riffboard", label: "RiffBoard" },
    { id: "recall", label: "Recall" },
    { id: "dna", label: "Learning DNA" },
    { id: "timeline", label: "Journey" },
  ];

  const handleItemClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/75 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/60"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Brand Logo & Wordmark */}
        <div
          onClick={() => handleItemClick("hero")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Abstract Adaptive Neural Pathway Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-emerald-500/20 border border-white/15 flex items-center justify-center backdrop-blur-md group-hover:border-indigo-400/50 transition-all duration-300 shadow-lg shadow-indigo-500/10">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white stroke-current fill-none stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19V5a2 2 0 0 1 2-2h6a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H6" />
              <path d="M12 12l6 7" />
              <circle cx="18" cy="19" r="1.5" className="fill-indigo-400 stroke-none" />
              <circle cx="12" cy="5" r="1.5" className="fill-emerald-400 stroke-none" />
            </svg>
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-0.5">
              Riff<span className="text-indigo-400">.</span>
            </span>
            <span className="hidden sm:block text-[9px] font-mono tracking-widest uppercase text-white/40 -mt-1">
              Neuro-Learning Engine
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md px-3 py-1.5 rounded-full shadow-inner shadow-white/5">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 relative ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-400/40 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Neuro-Read Quick Toggle & Demo Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNeuroRead}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all backdrop-blur-md"
            title="Open Neuro-Read Accessibility Controls"
          >
            <span className="text-sm">📖</span>
            <span>Neuro-Read</span>
          </button>

          <button
            onClick={() => handleItemClick("learn")}
            className="px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-95"
          >
            Start Learning
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/[0.05] border border-white/10 text-white"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0c]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-4"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onOpenNeuroRead();
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-300 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <span>📖</span> Neuro-Read Controls
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
