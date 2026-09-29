import test from "node:test";
import assert from "node:assert/strict";
import {
  createSessionEvent,
  recordConfidenceMilestone,
  createAdaptationRecord,
  loadSessionEvents,
  loadConfidenceJourney,
  clearSessionHistory,
} from "./riffController.js";

test("createSessionEvent records session events chronologically", () => {
  clearSessionHistory();
  const result = createSessionEvent({
    type: "friction_detected",
    title: "Friction Detected",
    detail: "Typing slowed vs personal baseline.",
    icon: "⚠️",
    badge: "RiffSense",
  });

  assert.ok(result.newEvent.id);
  assert.equal(result.newEvent.type, "friction_detected");
  assert.equal(result.newEvent.title, "Friction Detected");
});

test("recordConfidenceMilestone records comprehension progression", () => {
  clearSessionHistory();
  const journey = recordConfidenceMilestone("Teach-Back", 0.84, "teachback");
  const latest = journey[journey.length - 1];

  assert.equal(latest.label, "Teach-Back");
  assert.equal(latest.percentage, 84);
  assert.equal(latest.stage, "teachback");
});

test("createAdaptationRecord generates explainable observed signals", () => {
  const record = createAdaptationRecord({
    fromModality: "text",
    toModality: "visual",
    signals: {
      pacingSlowdown: true,
      backspaceRatio: 0.28,
      pauseDurationSec: 4.5,
      rapidCadenceShifts: 3,
    },
    reasonText: "Switching to visual model to relieve cognitive friction.",
  });

  assert.equal(record.fromModality, "text");
  assert.equal(record.toModality, "visual");
  assert.ok(record.observedSignals.length >= 3);
  assert.match(record.reasonText, /visual/i);
});
