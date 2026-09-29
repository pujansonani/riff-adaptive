// Maps a classified interest category (from /api/vibe) to a visual identity:
// an accent color pair and an emoji. Applied as CSS variables on the root
// element so the whole app quietly re-skins itself around what the student
// actually cares about, instead of one fixed color scheme for everyone.

export const VIBE_THEMES = {
  space: { emoji: "🚀", label: "space", accent: "#6c5ce7", accentSoft: "#efe9ff" },
  sports: { emoji: "🏀", label: "sports", accent: "#e17055", accentSoft: "#ffefe9" },
  gaming: { emoji: "🎮", label: "gaming", accent: "#00b894", accentSoft: "#e6fff7" },
  nature: { emoji: "🦕", label: "nature", accent: "#55a630", accentSoft: "#eefbe4" },
  magic: { emoji: "🪄", label: "magic", accent: "#9b5de5", accentSoft: "#f4ecff" },
  music: { emoji: "🎵", label: "music", accent: "#ff6b9d", accentSoft: "#ffeef4" },
  ocean: { emoji: "🌊", label: "ocean", accent: "#0984e3", accentSoft: "#e7f4ff" },
  food: { emoji: "🍕", label: "food", accent: "#f0932b", accentSoft: "#fff3e4" },
  vehicles: { emoji: "🏎️", label: "vehicles", accent: "#d63031", accentSoft: "#ffe9e8" },
  mystery: { emoji: "🔍", label: "mystery", accent: "#2d3436", accentSoft: "#eceff1" },
  art: { emoji: "🎨", label: "art", accent: "#e84393", accentSoft: "#ffe8f3" },
  everyday: { emoji: "✨", label: "everyday", accent: "#2d6e5e", accentSoft: "#eaf5f1" },
};

export function getVibeTheme(vibe) {
  return VIBE_THEMES[vibe] || VIBE_THEMES.everyday;
}
