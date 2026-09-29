// Mascot.jsx
// Friendly Riff Buddy character with expressive eyes, gentle breathing/bobbing animations,
// and encouraging speech bubbles.

import { motion } from "framer-motion";

export default function RiffMascot({ mood = "calm", message = null, size = "md" }) {
  const moods = {
    calm: {
      color: "#6C63FF",
      eyeY: 38,
      mouthPath: "M 38 52 Q 50 60 62 52",
      speech: "Hey! Ready to learn?",
      blush: true,
      sparkle: true,
    },
    thinking: {
      color: "#3A86FF",
      eyeY: 34,
      mouthPath: "M 42 54 Q 50 50 58 54",
      speech: "Figuring this out with you...",
      blush: false,
      sparkle: false,
    },
    offered: {
      color: "#FFB84D",
      eyeY: 36,
      mouthPath: "M 40 54 Q 50 48 60 54",
      speech: "No rush! Let’s try another way ✨",
      blush: true,
      sparkle: true,
    },
    hinted: {
      color: "#2EC4B6",
      eyeY: 38,
      mouthPath: "M 38 52 Q 50 62 62 52",
      speech: "Here’s a little hint to help!",
      blush: true,
      sparkle: true,
    },
    happy: {
      color: "#2EC4B6",
      eyeY: 36,
      mouthPath: "M 36 50 Q 50 66 64 50",
      speech: "You got it! High five! 🎉",
      blush: true,
      sparkle: true,
    },
    adapting: {
      color: "#FF5E7E",
      eyeY: 36,
      mouthPath: "M 40 52 Q 50 58 60 52",
      speech: "Switching to an easier way!",
      blush: true,
      sparkle: true,
    },
  };

  const current = moods[mood] || moods.calm;
  const currentMessage = message || current.speech;

  const sizeDimensions = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-24 h-24",
    hero: "w-32 h-32 sm:w-40 sm:h-40",
  };

  return (
    <div className="inline-flex items-center gap-3">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className={`relative ${sizeDimensions[size] || sizeDimensions.md} flex-shrink-0 cursor-pointer select-none group`}
      >
        {/* Soft Glow Behind Mascot */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-35 transition-all"
          style={{ backgroundColor: current.color }}
        />

        {/* Mascot SVG Vector Blob */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md relative z-10">
          {/* Main Friendly Blob Body */}
          <motion.path
            d="M 50 12 C 75 12, 90 28, 90 52 C 90 76, 75 90, 50 90 C 25 90, 10 76, 10 52 C 10 28, 25 12, 50 12 Z"
            fill={current.color}
            animate={{
              d: [
                "M 50 12 C 75 12, 90 28, 90 52 C 90 76, 75 90, 50 90 C 25 90, 10 76, 10 52 C 10 28, 25 12, 50 12 Z",
                "M 50 10 C 78 10, 92 26, 92 50 C 92 78, 78 92, 50 92 C 22 92, 8 78, 8 50 C 8 26, 22 10, 50 10 Z",
                "M 50 12 C 75 12, 90 28, 90 52 C 90 76, 75 90, 50 90 C 25 90, 10 76, 10 52 C 10 28, 25 12, 50 12 Z",
              ],
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />

          {/* Little Cute Antenna / Star Sprout */}
          <circle cx="50" cy="8" r="4.5" fill="#FFB84D" />
          <path d="M 50 12 L 50 8" stroke="#FFB84D" strokeWidth="2.5" strokeLinecap="round" />

          {/* Cheerful Eyes */}
          <circle cx="34" cy={current.eyeY} r="4.5" fill="#FFFFFF" />
          <circle cx="35.5" cy={current.eyeY - 1} r="2.5" fill="#263238" />
          <circle cx="37" cy={current.eyeY - 2} r="1" fill="#FFFFFF" />

          <circle cx="66" cy={current.eyeY} r="4.5" fill="#FFFFFF" />
          <circle cx="67.5" cy={current.eyeY - 1} r="2.5" fill="#263238" />
          <circle cx="69" cy={current.eyeY - 2} r="1" fill="#FFFFFF" />

          {/* Cheeks Blush */}
          {current.blush && (
            <>
              <ellipse cx="26" cy="46" rx="4" ry="2.5" fill="#FF5E7E" opacity="0.45" />
              <ellipse cx="74" cy="46" rx="4" ry="2.5" fill="#FF5E7E" opacity="0.45" />
            </>
          )}

          {/* Mouth */}
          <path
            d={current.mouthPath}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Encouraging Speech Bubble */}
      {currentMessage && size !== "hero" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: -6 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="relative px-3.5 py-1.5 bg-white border border-[#E8DEFF] rounded-2xl shadow-sm text-xs font-semibold text-[#263238] flex items-center gap-1.5"
        >
          {/* Bubble Pointer Tail */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-l border-b border-[#E8DEFF] rotate-45" />
          <span className="relative z-10">{currentMessage}</span>
        </motion.div>
      )}
    </div>
  );
}
