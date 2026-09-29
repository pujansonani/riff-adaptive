// A tiny inline-SVG face for Riff. No image assets, no generation API —
// just a handful of mouth/eye variants keyed by mood, recolored to match
// whatever "vibe" the student's interest was classified as.

const MOUTHS = {
  calm: "M 30 62 Q 46 72 62 62",
  offered: "M 38 64 Q 46 58 54 64",
  hinted: "M 26 58 Q 46 82 66 58",
  thinking: "M 38 66 Q 46 62 54 66",
};

export default function RiffMascot({ mood = "calm", accent = "#2d6e5e" }) {
  const mouth = MOUTHS[mood] || MOUTHS.calm;
  const eyesUp = mood === "thinking";
  const eyeY = eyesUp ? 36 : 40;

  return (
    <svg
      viewBox="0 0 92 92"
      width="52"
      height="52"
      className="riff-mascot"
      role="img"
      aria-label={`Riff mascot, feeling ${mood}`}
    >
      <circle cx="46" cy="46" r="42" fill={accent} opacity="0.12" />
      <circle cx="46" cy="46" r="34" fill="var(--paper-raised)" stroke={accent} strokeWidth="2.5" />
      <circle cx={eyesUp ? 34 : 32} cy={eyeY} r="4.2" fill={accent} />
      <circle cx={eyesUp ? 58 : 60} cy={eyeY} r="4.2" fill={accent} />
      <path d={mouth} stroke={accent} strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
