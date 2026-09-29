import test from "node:test";
import assert from "node:assert/strict";
import { inferLearnerState, evaluateLearnerFriction, LEARNER_STATES } from "./frictionModel.js";

test("inferLearnerState classifies steady typing as focused", () => {
  const signals = {
    totalKeys: 25,
    typingPacingZScore: -0.2,
    backspaceRatio: 0.04,
    idleDurationMs: 400,
    rapidCadenceShifts: 0,
    repeatedCorrections: 0,
    textLength: 65,
  };

  const result = inferLearnerState(signals);
  assert.equal(result.state, LEARNER_STATES.FOCUSED);
  assert.equal(result.isFrictionDetected, false);
  assert.ok(result.probabilities.focused > 0.4);
});

test("inferLearnerState classifies repeated backspacing and high z-score as struggling", () => {
  const signals = {
    totalKeys: 30,
    typingPacingZScore: 2.1,
    backspaceRatio: 0.35,
    idleDurationMs: 1200,
    rapidCadenceShifts: 4,
    repeatedCorrections: 3,
    textLength: 15,
  };

  const result = inferLearnerState(signals);
  assert.equal(result.state, LEARNER_STATES.STRUGGLING);
  assert.equal(result.isFrictionDetected, true);
  assert.equal(result.recommendedSupport, "micro_step");
});

test("inferLearnerState classifies extended pause and low progress as disengaging", () => {
  const signals = {
    totalKeys: 15,
    typingPacingZScore: 0.5,
    backspaceRatio: 0.05,
    idleDurationMs: 8000,
    rapidCadenceShifts: 0,
    repeatedCorrections: 0,
    textLength: 10,
  };

  const result = inferLearnerState(signals);
  assert.equal(result.state, LEARNER_STATES.DISENGAGING);
  assert.equal(result.isFrictionDetected, true);
});

test("evaluateLearnerFriction provides fallback without crashing on bad input", () => {
  const result = evaluateLearnerFriction(null);
  assert.ok(result.state);
  assert.ok(typeof result.frictionScore === "number");
});
