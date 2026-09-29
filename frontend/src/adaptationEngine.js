// adaptationEngine.js
// RiffAdapt: The Adaptive Decision Engine.
// Integrates signals, behavior ML inference, comprehension scores,
// memory retention queue, and modality profiles to determine the optimal pedagogical intervention.

export const INTERVENTIONS = {
  MICRO_STEP: "micro_step",
  VISUAL_BOARD: "visual_board",
  READING_SUPPORT: "reading_support",
  VOICE_EXPLAIN: "voice_explain",
  BRIDGE_ANALOGY: "bridge_analogy",
  SIMPLER_CONCEPT: "simpler_concept",
  TEACH_BACK: "teach_back",
  RETRIEVAL_PRACTICE: "retrieval_practice",
  INTERACTIVE_CHALLENGE: "interactive_challenge",
  CONTINUE_FLOW: "continue_flow",
};

/**
 * Evaluates the learner's context and determines the next best adaptation.
 *
 * @param {Object} context
 * @param {Object} context.behaviorState - { state, confidence, frictionScore, isFrictionDetected }
 * @param {number|null} context.understandingConfidence - 0 to 1
 * @param {number} context.retentionDueCount - number of review cards due
 * @param {string} context.preferredModality - top modality from learner profile
 * @param {string} context.interest - current student interest
 * @param {boolean} context.hasLesson - whether a lesson is active
 * @param {number} context.attemptsCount - attempts made on current prompt
 */
export function decideAdaptation(context) {
  const {
    behaviorState = { state: "focused", confidence: 0.8, frictionScore: 0.1, isFrictionDetected: false },
    understandingConfidence = null,
    retentionDueCount = 0,
    preferredModality = "analogy",
    interest = "",
    hasLesson = false,
    attemptsCount = 0,
  } = context;

  const state = behaviorState.state || "focused";
  const friction = behaviorState.frictionScore || 0;
  const isStuck = behaviorState.isFrictionDetected || friction > 0.55;

  // 1. If student is actively struggling with high friction:
  if (isStuck && state === "struggling") {
    if (preferredModality === "visual") {
      return {
        intervention: INTERVENTIONS.VISUAL_BOARD,
        reason: "high_friction_visual_preference",
        confidence: 0.88,
        modality: "visual",
        message: "Riff noticed you may be getting stuck. Let's try sketching this out visually on RiffBoard.",
        actions: [
          { id: "open_whiteboard", label: "Open RiffBoard Canvas", primary: true },
          { id: "step_mode", label: "Break into micro-steps" },
          { id: "hint", label: "Give me a hint" },
        ],
      };
    }

    return {
      intervention: INTERVENTIONS.MICRO_STEP,
      reason: "high_friction_cognitive_load",
      confidence: 0.86,
      modality: "micro-step",
      message: "Riff noticed you may be getting stuck. Let's make this easier: start with just this one step.",
      actions: [
        { id: "step_mode", label: "Break into 1 micro-step", primary: true },
        { id: "open_whiteboard", label: "Try visual whiteboard" },
        { id: "simpler", label: "Explain it simpler" },
      ],
    };
  }

  // 2. If student is disengaging or inactive:
  if (state === "disengaging" || (friction > 0.45 && state === "disengaging")) {
    const interestLabel = interest ? ` about ${interest}` : "";
    return {
      intervention: INTERVENTIONS.INTERACTIVE_CHALLENGE,
      reason: "inactivity_disengagement",
      confidence: 0.79,
      modality: "interactive",
      message: `Let's switch it up! Here is a quick mini-challenge${interestLabel}.`,
      actions: [
        { id: "mini_challenge", label: "Take 10-second Challenge", primary: true },
        { id: "bridge", label: "Connect with a Bridge" },
        { id: "read_aloud", label: "Listen to Audio" },
      ],
    };
  }

  // 3. If student submitted an answer and confidence is low:
  if (understandingConfidence !== null && understandingConfidence < 0.45) {
    return {
      intervention: INTERVENTIONS.SIMPLER_CONCEPT,
      reason: "low_comprehension_confidence",
      confidence: 0.84,
      modality: preferredModality === "analogy" ? "analogy" : "text",
      message: "Let's try another way. Here is a simpler explanation with a concrete example.",
      actions: [
        { id: "simpler", label: "Read simpler version", primary: true },
        { id: "diagnose", label: "Debug my thinking" },
        { id: "open_whiteboard", label: "Draw concept diagram" },
      ],
    };
  }

  // 4. If student has high confidence and retention cards are due:
  if (
    (understandingConfidence !== null && understandingConfidence >= 0.75) ||
    (hasLesson && retentionDueCount > 0 && Math.random() < 0.5)
  ) {
    if (retentionDueCount > 0) {
      return {
        intervention: INTERVENTIONS.RETRIEVAL_PRACTICE,
        reason: "spaced_repetition_due",
        confidence: 0.82,
        modality: "retrieval",
        message: `You've understood this before; let's refresh ${retentionDueCount} quick flashback question${retentionDueCount > 1 ? "s" : ""}.`,
        actions: [
          { id: "quick_recall", label: "Quick Recall (1 min)", primary: true },
          { id: "flashcards", label: "Review Flashcards" },
          { id: "teachback", label: "Teach it to my buddy" },
        ],
      };
    }

    return {
      intervention: INTERVENTIONS.TEACH_BACK,
      reason: "mastery_reinforcement",
      confidence: 0.85,
      modality: "teach-back",
      message: "Awesome grasp! Prove your mastery by teaching it back in your own words.",
      actions: [
        { id: "teachback", label: "Teach It Back", primary: true },
        { id: "flashcards", label: "Generate Flashcards" },
        { id: "quiz", label: "Practice Quiz" },
      ],
    };
  }

  // 5. Default flow with modality nudges:
  return {
    intervention: INTERVENTIONS.CONTINUE_FLOW,
    reason: "steady_progression",
    confidence: 0.75,
    modality: preferredModality,
    message: "Riff is adapting to your pace. You're doing great!",
    actions: [
      { id: "read_aloud", label: "Audio Read Aloud" },
      { id: "neuro_read", label: "Reading Support" },
      { id: "open_whiteboard", label: "RiffBoard" },
    ],
  };
}
