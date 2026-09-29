// frictionModel.js
// Interpretable ML-based interaction model for estimating cognitive friction states.
// Compares signals against the learner's personal baseline.

import { evaluateSupportState as fallbackSupportState } from "./supportLogic.js";

export const LEARNER_STATES = {
  FOCUSED: "focused",
  UNCERTAIN: "uncertain",
  STRUGGLING: "struggling",
  DISENGAGING: "disengaging",
};

function sigmoid(z) {
  return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
}

function softmax(scores) {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => (sum > 0 ? e / sum : 0.25));
}

/**
 * Weights for the linear classifiers estimating state logits.
 * Calibrated for cognitive load and interaction friction dynamics.
 */
const CLASSIFIER_WEIGHTS = {
  // Positive cues: steady pacing, moderate speed, low backspaces, low idle
  focused: {
    bias: 1.2,
    pacingZScore: -0.8,
    backspaceRatio: -2.5,
    idleSec: -1.2,
    cadenceShifts: -0.6,
    repeatedCorrections: -1.0,
    textProgress: 0.8,
  },
  // Pauses before typing, occasional backspaces, exploring ideas
  uncertain: {
    bias: -0.2,
    pacingZScore: 0.7,
    backspaceRatio: 1.2,
    idleSec: 0.5,
    cadenceShifts: 0.9,
    repeatedCorrections: 0.4,
    textProgress: 0.2,
  },
  // High backspaces, heavy stutter in rhythm, repeated deletion cycles, high variance
  struggling: {
    bias: -1.4,
    pacingZScore: 1.5,
    backspaceRatio: 3.8,
    idleSec: 0.8,
    cadenceShifts: 1.6,
    repeatedCorrections: 2.2,
    textProgress: -0.5,
  },
  // Extended idle pauses, sudden drop in keys, long inactivity
  disengaging: {
    bias: -1.8,
    pacingZScore: 0.4,
    backspaceRatio: -0.2,
    idleSec: 3.2,
    cadenceShifts: -0.3,
    repeatedCorrections: -0.4,
    textProgress: -1.2,
  },
};

/**
 * Computes calibrated ML state probabilities from normalized learning signals.
 */
export function inferLearnerState(signals) {
  if (!signals || signals.totalKeys < 4) {
    // Cold start state
    return {
      state: LEARNER_STATES.FOCUSED,
      confidence: 0.6,
      probabilities: {
        focused: 0.65,
        uncertain: 0.2,
        struggling: 0.1,
        disengaging: 0.05,
      },
      frictionScore: 0.15,
      isFrictionDetected: false,
      recommendedSupport: null,
      source: "cold_start",
    };
  }

  // Feature vector extraction
  const pacingZ = Math.min(3, Math.max(-3, signals.typingPacingZScore || 0));
  const backspaceR = Math.min(1, Math.max(0, signals.backspaceRatio || 0));
  const idleSec = Math.min(15, Math.max(0, (signals.idleDurationMs || 0) / 1000));
  const cadenceShifts = Math.min(6, signals.rapidCadenceShifts || 0);
  const repeatedCorr = Math.min(5, signals.repeatedCorrections || 0);
  const textProg = Math.min(2, (signals.textLength || 0) / 60);

  const states = ["focused", "uncertain", "struggling", "disengaging"];
  const rawLogits = states.map((stateKey) => {
    const w = CLASSIFIER_WEIGHTS[stateKey];
    return (
      w.bias +
      w.pacingZScore * pacingZ +
      w.backspaceRatio * backspaceR +
      w.idleSec * idleSec +
      w.cadenceShifts * cadenceShifts +
      w.repeatedCorrections * repeatedCorr +
      w.textProgress * textProg
    );
  });

  const probs = softmax(rawLogits);
  const probMap = {
    focused: Number(probs[0].toFixed(3)),
    uncertain: Number(probs[1].toFixed(3)),
    struggling: Number(probs[2].toFixed(3)),
    disengaging: Number(probs[3].toFixed(3)),
  };

  // Find max probability state
  let dominantState = LEARNER_STATES.FOCUSED;
  let maxProb = probMap.focused;

  for (const [s, p] of Object.entries(probMap)) {
    if (p > maxProb) {
      maxProb = p;
      dominantState = s;
    }
  }

  // Continuous composite friction score (0 to 1)
  const frictionScore = Number(
    Math.min(
      1,
      Math.max(
        0,
        probMap.struggling * 0.95 +
          probMap.disengaging * 0.8 +
          probMap.uncertain * 0.45 -
          probMap.focused * 0.35 +
          0.1
      )
    ).toFixed(3)
  );

  const isFrictionDetected =
    (dominantState === LEARNER_STATES.STRUGGLING && maxProb > 0.4) ||
    (dominantState === LEARNER_STATES.DISENGAGING && maxProb > 0.45) ||
    frictionScore > 0.58;

  // Determine supportive suggestion without medical labeling
  let recommendedSupport = null;
  if (dominantState === LEARNER_STATES.STRUGGLING) {
    recommendedSupport = "micro_step";
  } else if (dominantState === LEARNER_STATES.DISENGAGING) {
    recommendedSupport = "interactive_challenge";
  } else if (dominantState === LEARNER_STATES.UNCERTAIN) {
    recommendedSupport = "targeted_hint";
  }

  return {
    state: dominantState,
    confidence: Number(maxProb.toFixed(2)),
    probabilities: probMap,
    frictionScore,
    isFrictionDetected,
    recommendedSupport,
    source: "ml_classifier",
  };
}

/**
 * Predicts support need with graceful fallback.
 * Uses ML classifier first, falling back to heuristic if data is incomplete.
 */
export function evaluateLearnerFriction(signals) {
  try {
    const mlResult = inferLearnerState(signals);
    if (mlResult && mlResult.source === "ml_classifier") {
      return mlResult;
    }
  } catch (err) {
    console.warn("ML inference encountered error, falling back to heuristic", err);
  }

  // Fallback to legacy rule-based detector
  const legacyFeatures = {
    backspaceRatio: signals?.backspaceRatio || 0,
    deviationPct: signals?.deviationPct || 0,
    recentAvg: signals?.currentIntervalAvg || 0,
    rapidChanges: signals?.rapidCadenceShifts || 0,
  };
  const legacy = fallbackSupportState(legacyFeatures, signals?.totalKeys || 0);

  return {
    state: legacy.shouldOffer ? LEARNER_STATES.STRUGGLING : LEARNER_STATES.FOCUSED,
    confidence: legacy.confidence,
    probabilities: {
      focused: legacy.shouldOffer ? 0.2 : 0.8,
      uncertain: 0.1,
      struggling: legacy.shouldOffer ? 0.65 : 0.1,
      disengaging: 0.05,
    },
    frictionScore: legacy.confidence,
    isFrictionDetected: legacy.shouldOffer,
    recommendedSupport: legacy.shouldOffer ? "targeted_hint" : null,
    source: "heuristic_fallback",
  };
}
