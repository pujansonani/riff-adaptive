// riffController.js
// Centralized Riff Autopilot Controller:
// Orchestrates the core loop: OBSERVE ↓ DETECT ↓ UNDERSTAND ↓ ADAPT ↓ TEACH ↓ PRACTICE ↓ MEASURE ↓ REMEMBER ↓ ADAPT AGAIN

const SESSION_STORAGE_KEY = "riff_session_events_v1";
const CONFIDENCE_STORAGE_KEY = "riff_learning_confidence_v1";

export const AUTOPILOT_STATES = {
  OBSERVING: "observing",
  THINKING: "thinking",
  ADAPTING: "adapting",
  HELPING: "helping",
  LEARNING: "learning",
};

/**
 * Loads session timeline events from localStorage.
 */
export function loadSessionEvents() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves session timeline events to localStorage.
 */
export function saveSessionEvents(events) {
  if (typeof window === "undefined" || !window.localStorage) return events;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(events.slice(-50)));
  } catch (e) {
    console.warn("Failed to persist session events", e);
  }
  return events;
}

/**
 * Loads learning confidence journey points.
 */
export function loadConfidenceJourney() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [{ label: "Start", confidence: 0.35, timestamp: Date.now(), stage: "initial" }];
  }
  try {
    const raw = window.localStorage.getItem(CONFIDENCE_STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : [{ label: "Start", confidence: 0.35, timestamp: Date.now(), stage: "initial" }];
  } catch {
    return [{ label: "Start", confidence: 0.35, timestamp: Date.now(), stage: "initial" }];
  }
}

/**
 * Saves learning confidence journey points.
 */
export function saveConfidenceJourney(points) {
  if (typeof window === "undefined" || !window.localStorage) return points;
  try {
    window.localStorage.setItem(CONFIDENCE_STORAGE_KEY, JSON.stringify(points.slice(-20)));
  } catch (e) {
    console.warn("Failed to persist confidence points", e);
  }
  return points;
}

/**
 * Creates a structured session event and appends to history.
 */
export function createSessionEvent({
  type, // 'lesson_start' | 'friction_detected' | 'adaptation_triggered' | 'understanding_checked' | 'modality_switch' | 'teachback' | 'recall_scheduled'
  title,
  detail,
  icon = "●",
  badge = null,
}) {
  const newEvent = {
    id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    timeStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type,
    title,
    detail,
    icon,
    badge,
  };

  const currentEvents = loadSessionEvents();
  const updated = [...currentEvents, newEvent];
  saveSessionEvents(updated);
  return { updated, newEvent };
}

/**
 * Records a confidence milestone.
 */
export function recordConfidenceMilestone(label, confidence, stage = "interaction") {
  const current = loadConfidenceJourney();
  const clamped = Math.max(0.05, Math.min(1.0, Number(confidence) || 0.5));
  const newPoint = {
    id: `conf-${Date.now()}`,
    label,
    confidence: Number(clamped.toFixed(2)),
    percentage: Math.round(clamped * 100),
    timestamp: Date.now(),
    timeStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    stage,
  };

  const updated = [...current, newPoint];
  saveConfidenceJourney(updated);
  return updated;
}

/**
 * Creates a structured adaptation event for explainability.
 */
export function createAdaptationRecord({
  fromModality,
  toModality,
  signals = {},
  reasonText,
}) {
  const observedSignals = [];
  if (signals.pacingSlowdown || (signals.typingPacingZScore && signals.typingPacingZScore > 1.2)) {
    observedSignals.push("Typing slowed compared with your personal baseline pace");
  }
  if (signals.backspaceRatio && signals.backspaceRatio > 0.18) {
    observedSignals.push(`Frequent revision patterns (${Math.round(signals.backspaceRatio * 100)}% backspace ratio)`);
  }
  if (signals.pauseDurationSec && signals.pauseDurationSec > 3) {
    observedSignals.push(`Extended thinking pause (${signals.pauseDurationSec}s)`);
  }
  if (signals.rapidCadenceShifts && signals.rapidCadenceShifts >= 2) {
    observedSignals.push("Sudden variations in typing rhythm");
  }
  if (observedSignals.length === 0) {
    observedSignals.push("Riff observed friction in your current learning interaction");
  }

  return {
    id: `adapt-${Date.now()}`,
    timestamp: Date.now(),
    fromModality,
    toModality,
    observedSignals,
    reasonText:
      reasonText ||
      `Switching to ${toModality} because it has historically helped you comprehend concepts with greater ease.`,
    outcome: null, // 'helped' | 'somewhat' | 'not_really'
    confidenceDelta: null,
  };
}

/**
 * Clears session events for starting a fresh lesson session.
 */
export function clearSessionHistory() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.removeItem(CONFIDENCE_STORAGE_KEY);
    } catch {}
  }
}
