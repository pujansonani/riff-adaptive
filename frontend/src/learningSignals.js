// learningSignals.js
// Extracts keystroke dynamics, pause distributions, and interaction signals
// compared strictly against the student's personal baseline.

const BASELINE_STORAGE_KEY = "riff_behavior_baseline_v1";

/**
 * Loads the student's stored personal baseline from localStorage.
 */
export function loadPersonalBaseline() {
  if (typeof window === "undefined" || !window.localStorage) {
    return { meanKeyInterval: 260, varianceKeyInterval: 4000, meanPauseDuration: 850, totalInteractions: 0 };
  }
  try {
    const raw = window.localStorage.getItem(BASELINE_STORAGE_KEY);
    if (!raw) {
      return { meanKeyInterval: 260, varianceKeyInterval: 4000, meanPauseDuration: 850, totalInteractions: 0 };
    }
    return JSON.parse(raw);
  } catch {
    return { meanKeyInterval: 260, varianceKeyInterval: 4000, meanPauseDuration: 850, totalInteractions: 0 };
  }
}

/**
 * Saves and updates the student's moving baseline.
 * Uses exponential smoothing so their baseline updates as they write more.
 */
export function savePersonalBaseline(currentBaseline, newIntervals = []) {
  if (!newIntervals || newIntervals.length === 0) return currentBaseline;
  
  const valid = newIntervals.filter((v) => typeof v === "number" && v > 50 && v < 5000);
  if (valid.length === 0) return currentBaseline;

  const sessionMean = valid.reduce((a, b) => a + b, 0) / valid.length;
  const sessionVariance = valid.reduce((sum, v) => sum + (v - sessionMean) ** 2, 0) / valid.length;

  const alpha = 0.15; // smooth updating factor
  const updated = {
    meanKeyInterval: currentBaseline.meanKeyInterval * (1 - alpha) + sessionMean * alpha,
    varianceKeyInterval: currentBaseline.varianceKeyInterval * (1 - alpha) + sessionVariance * alpha,
    meanPauseDuration: currentBaseline.meanPauseDuration || 850,
    totalInteractions: (currentBaseline.totalInteractions || 0) + valid.length,
  };

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist personal baseline", e);
    }
  }

  return updated;
}

/**
 * Extracts normalized interaction features from live typing and session telemetry.
 */
export function extractLearningSignals({
  recentIntervals = [],
  baseline = null,
  backspaceCount = 0,
  totalKeys = 0,
  idleDurationMs = 0,
  repeatedCorrections = 0,
  timeOnTaskMs = 0,
  textLength = 0,
  attemptsCount = 1,
  hintRequestsCount = 0,
}) {
  const intervals = recentIntervals.slice(-10);
  const currentIntervalAvg = intervals.length > 0
    ? intervals.reduce((a, b) => a + b, 0) / intervals.length
    : (baseline?.meanKeyInterval || 250);

  const baselineMean = baseline?.meanKeyInterval || currentIntervalAvg;
  const baselineVar = baseline?.varianceKeyInterval || 4000;
  const baselineStd = Math.max(20, Math.sqrt(baselineVar));

  // Z-score comparison against personal baseline
  const typingPacingZScore = (currentIntervalAvg - baselineMean) / baselineStd;
  
  // Deviation percentage compared to own baseline
  const deviationPct = baselineMean > 0
    ? ((currentIntervalAvg - baselineMean) / baselineMean) * 100
    : 0;

  // Key interval variance (fluctuation in rhythm)
  const currentVariance = intervals.length > 1
    ? intervals.reduce((sum, v) => sum + (v - currentIntervalAvg) ** 2, 0) / intervals.length
    : 0;

  // Backspace / revision frequency
  const backspaceRatio = totalKeys > 0 ? backspaceCount / totalKeys : 0;

  // Rapid changes in key-to-key cadence
  const rapidCadenceShifts = intervals.filter(
    (v, i) => i > 0 && Math.abs(v - intervals[i - 1]) > 140
  ).length;

  // Long pauses (> 2.5s)
  const isCurrentlyPaused = idleDurationMs > 2500;
  const pauseDurationSec = idleDurationMs / 1000;

  // Words per minute estimate based on key intervals
  const estimatedWpm = currentIntervalAvg > 0
    ? Math.round(60000 / (currentIntervalAvg * 5))
    : 0;

  return {
    currentIntervalAvg: Math.round(currentIntervalAvg),
    baselineMean: Math.round(baselineMean),
    typingPacingZScore: Number(typingPacingZScore.toFixed(2)),
    deviationPct: Number(deviationPct.toFixed(1)),
    currentVariance: Math.round(currentVariance),
    backspaceRatio: Number(backspaceRatio.toFixed(3)),
    backspaceCount,
    totalKeys,
    rapidCadenceShifts,
    idleDurationMs,
    pauseDurationSec: Number(pauseDurationSec.toFixed(1)),
    isCurrentlyPaused,
    repeatedCorrections,
    timeOnTaskSec: Math.round(timeOnTaskMs / 1000),
    textLength,
    attemptsCount,
    hintRequestsCount,
    estimatedWpm,
  };
}
