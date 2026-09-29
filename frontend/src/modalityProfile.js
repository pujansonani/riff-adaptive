// modalityProfile.js
// Learner Modality Profile: dynamically tracks which learning modalities
// yield the strongest comprehension and engagement for this individual learner.
// All metrics are purely relative to the learner's own history.

const PROFILE_STORAGE_KEY = "riff_learning_profile_v1";

export const MODALITIES = [
  "visual",
  "text",
  "audio",
  "analogy",
  "micro-step",
  "interactive",
  "teach-back",
  "retrieval",
];

const DEFAULT_PROFILE = {
  visual: { pulls: 1, totalReward: 0.6, affinity: 0.6 },
  text: { pulls: 1, totalReward: 0.6, affinity: 0.6 },
  audio: { pulls: 1, totalReward: 0.6, affinity: 0.6 },
  analogy: { pulls: 1, totalReward: 0.65, affinity: 0.65 },
  "micro-step": { pulls: 1, totalReward: 0.65, affinity: 0.65 },
  interactive: { pulls: 1, totalReward: 0.6, affinity: 0.6 },
  "teach-back": { pulls: 1, totalReward: 0.6, affinity: 0.6 },
  retrieval: { pulls: 1, totalReward: 0.6, affinity: 0.6 },
  totalSessions: 0,
  lastUpdated: null,
};

export function loadModalityProfile() {
  if (typeof window === "undefined" || !window.localStorage) {
    return { ...DEFAULT_PROFILE };
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveModalityProfile(profile) {
  if (typeof window === "undefined" || !window.localStorage) return profile;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn("Failed to persist modality profile", err);
  }
  return profile;
}

/**
 * Updates a modality's statistics with a normalized reward score (0 to 1).
 */
export function recordModalityOutcome(profile, modality, reward) {
  if (!modality || !profile[modality]) return profile;

  const current = profile[modality] || { pulls: 0, totalReward: 0, affinity: 0.5 };
  const clampedReward = Math.max(0, Math.min(1.25, Number(reward) || 0));

  const newPulls = current.pulls + 1;
  const newTotal = current.totalReward + clampedReward;
  const newAffinity = Number((newTotal / newPulls).toFixed(3));

  const updated = {
    ...profile,
    [modality]: {
      pulls: newPulls,
      totalReward: Number(newTotal.toFixed(3)),
      affinity: newAffinity,
    },
    totalSessions: (profile.totalSessions || 0) + 1,
    lastUpdated: Date.now(),
  };

  saveModalityProfile(updated);
  return updated;
}

/**
 * Returns the highest affinity modality and a ranking of all modalities.
 */
export function getModalityInsights(profile) {
  const current = profile || loadModalityProfile();
  const ranked = MODALITIES.map((mod) => {
    const stats = current[mod] || { pulls: 1, totalReward: 0.5, affinity: 0.5 };
    return {
      modality: mod,
      affinity: stats.affinity,
      pulls: stats.pulls,
    };
  }).sort((a, b) => b.affinity - a.affinity);

  const top = ranked[0];
  return {
    topModality: top?.modality || "analogy",
    topAffinity: top?.affinity || 0.65,
    ranked,
    summary: `Riff has observed you learn smoothly with ${top?.modality || "analogy"}-oriented methods.`,
  };
}
