// Navbar.jsx
// Warm, friendly navigation for kids and teens with soft rounded pill links and cheerful branding.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ onNavigate, activeSection, onOpenNeuroRead }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "learn", label: "📚 My Desk" },
    { id: "adaptive-engine", label: "✨ How Riff Helps" },
    { id: "riffboard", label: "🎨 Draw It" },
    { id: "recall", label: "🧠 Remember" },
    { id: "dna", label: "🌟 My Style" },
    { id: "timeline", label: "📖 My Story" },
  ];

  const handleItemClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FFF9F0]/90 backdrop-blur-md border-b border-[#E8DEFF] shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Friendly Brand Mark */}
        <div
          onClick={() => handleItemClick("hero")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          role="button"
          aria-label="Riff Home"
        >
          {/* Mascot Icon */}
          <div className="w-10 h-10 rounded-2xl bg-[#E8DEFF] border-2 border-[#6C63FF]/30 flex items-center justify-center group-hover:scale-105 group-hover:rotate-3 transition-transform shadow-sm">
            <span className="text-xl">🌟</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-tight text-[#263238] flex items-center gap-1">
              Riff<span className="text-[#FF5E7E]">.</span>
            </span>
            <span className="text-[11px] font-sans font-semibold text-[#6C63FF] -mt-1 hidden sm:block">
              your learning buddy
            </span>
          </div>
        </div>

        {/* Center: Friendly Rounded Pills */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white border border-[#E8DEFF] p-1.5 rounded-full shadow-card">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold font-sans transition-all duration-200 relative ${
                  isActive
                    ? "text-[#6C63FF]"
                    : "text-[#546E7A] hover:text-[#263238] hover:bg-[#FFF9F0]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeKidNavPill"
                    className="absolute inset-0 bg-[#E8DEFF] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Reading Comfort & Start Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNeuroRead}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-[#FFF3D6] border border-[#FFB84D]/40 text-xs font-bold text-[#546E7A] hover:text-[#263238] transition-all shadow-sm"
            title="Make Reading Comfortable"
          >
            <span>📖</span>
            <span>Easy Reading</span>
          </button>

          <button
            onClick={() => handleItemClick("learn")}
            className="px-5 py-2.5 rounded-full bg-[#6C63FF] hover:bg-[#534BD6] text-white text-xs font-bold transition-all shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            Start Learning ✨
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-white border border-[#E8DEFF] text-[#263238]"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#E8DEFF] px-6 py-4 shadow-lg"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold text-[#263238] hover:bg-[#FFF9F0] transition-all flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-[#6C63FF]">→</span>
                </button>
              ))}
              <button
                onClick={() => {
                  onOpenNeuroRead();
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold text-[#FFB84D] hover:bg-[#FFF3D6] transition-all flex items-center gap-2"
              >
                <span>📖</span> Easy Reading Options
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
