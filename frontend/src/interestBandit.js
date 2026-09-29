// A small epsilon-greedy multi-armed bandit that quietly learns, per student,
// which *kind* of interest framing (space, sports, gaming, ...) actually leads
// to fast, confident understanding for them — versus which just sounds fun but
// doesn't stick. Everything here is pure and testable; persistence is a thin
// wrapper around localStorage at the bottom.

const STORAGE_KEY = "riff-bandit-v1";

export function loadBanditState() {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveBanditState(stats) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Private browsing / storage disabled — the bandit just won't persist across visits.
  }
}

export function updateStats(stats, arm, reward) {
  if (!arm) return stats;
  const prev = stats[arm] || { pulls: 0, totalReward: 0 };
  return {
    ...stats,
    [arm]: {
      pulls: prev.pulls + 1,
      totalReward: prev.totalReward + reward,
    },
  };
}

function averageReward(entry) {
  if (!entry || entry.pulls === 0) return null;
  return entry.totalReward / entry.pulls;
}

// Picks which arm (interest category) to lean into next. Explores every arm at
// least once, then mostly exploits the strongest performer with some ongoing
// random exploration (epsilon) so it can keep noticing if things change.
export function chooseArm(stats, arms, { epsilon = 0.2, random = Math.random } = {}) {
  if (!arms || !arms.length) return null;

  const unexplored = arms.filter((arm) => !stats[arm] || stats[arm].pulls === 0);
  if (unexplored.length) {
    return unexplored[Math.floor(random() * unexplored.length)];
  }

  if (random() < epsilon) {
    return arms[Math.floor(random() * arms.length)];
  }

  return arms.reduce((best, arm) => {
    const armScore = averageReward(stats[arm]);
    const bestScore = averageReward(stats[best]);
    return armScore > bestScore ? arm : best;
  }, arms[0]);
}

// Surfaces a human-readable insight once there's enough evidence to say something
// meaningful — otherwise returns null so the UI can simply stay quiet.
export function bestArmInsight(stats, minPulls = 2) {
  const entries = Object.entries(stats || {}).filter(([, v]) => v.pulls >= minPulls);
  if (!entries.length) return null;

  const [arm, data] = entries.reduce((best, curr) =>
    averageReward(curr[1]) > averageReward(best[1]) ? curr : best
  );

  return { arm, average: averageReward(data), pulls: data.pulls };
}

// Turns one round's outcome into a reward signal the bandit can learn from:
// baseline is how well they understood it, with bonuses for not needing a
// hint and for staying engaged rather than stalling.
export function computeBanditReward({ confidence = 0, usedHint = false, timeToSubmitMs = null }) {
  let reward = confidence;
  if (!usedHint) reward += 0.15;
  if (timeToSubmitMs !== null && timeToSubmitMs < 45000) reward += 0.1;
  return Math.max(0, Math.min(1.25, reward));
}
