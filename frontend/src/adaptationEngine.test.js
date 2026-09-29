import test from "node:test";
import assert from "node:assert/strict";
import { decideAdaptation, INTERVENTIONS } from "./adaptationEngine.js";

test("decideAdaptation recommends micro-step when student experiences high friction", () => {
  const context = {
    behaviorState: { state: "struggling", confidence: 0.85, frictionScore: 0.8, isFrictionDetected: true },
    understandingConfidence: 0.3,
    preferredModality: "text",
    hasLesson: true,
  };

  const decision = decideAdaptation(context);
  assert.equal(decision.intervention, INTERVENTIONS.MICRO_STEP);
  assert.ok(decision.actions.some((a) => a.id === "step_mode"));
});

test("decideAdaptation recommends whiteboard when high friction and visual preference", () => {
  const context = {
    behaviorState: { state: "struggling", confidence: 0.85, frictionScore: 0.8, isFrictionDetected: true },
    preferredModality: "visual",
    hasLesson: true,
  };

  const decision = decideAdaptation(context);
  assert.equal(decision.intervention, INTERVENTIONS.VISUAL_BOARD);
  assert.ok(decision.actions.some((a) => a.id === "open_whiteboard"));
});

test("decideAdaptation recommends retrieval practice when reviews are due and understanding is solid", () => {
  const context = {
    behaviorState: { state: "focused", confidence: 0.9, frictionScore: 0.1, isFrictionDetected: false },
    understandingConfidence: 0.85,
    retentionDueCount: 3,
    hasLesson: true,
  };

  const decision = decideAdaptation(context);
  assert.equal(decision.intervention, INTERVENTIONS.RETRIEVAL_PRACTICE);
  assert.match(decision.message, /refresh/i);
});

test("decideAdaptation recommends interactive challenge on disengagement", () => {
  const context = {
    behaviorState: { state: "disengaging", confidence: 0.75, frictionScore: 0.6, isFrictionDetected: true },
    interest: "basketball",
    hasLesson: true,
  };

  const decision = decideAdaptation(context);
  assert.equal(decision.intervention, INTERVENTIONS.INTERACTIVE_CHALLENGE);
  assert.match(decision.message, /basketball/i);
});
