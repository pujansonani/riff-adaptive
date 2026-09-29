import test from "node:test";
import assert from "node:assert/strict";
import { extractLearningSignals, savePersonalBaseline } from "./learningSignals.js";

test("extractLearningSignals computes normalized pacing and backspace ratio against personal baseline", () => {
  const baseline = { meanKeyInterval: 250, varianceKeyInterval: 4000, meanPauseDuration: 850 };
  const recentIntervals = [300, 320, 310, 290, 330, 350];
  const signals = extractLearningSignals({
    recentIntervals,
    baseline,
    backspaceCount: 4,
    totalKeys: 20,
    idleDurationMs: 600,
    repeatedCorrections: 1,
    timeOnTaskMs: 15000,
    textLength: 50,
  });

  assert.ok(signals.currentIntervalAvg > 280);
  assert.equal(signals.backspaceRatio, 0.2);
  assert.equal(signals.totalKeys, 20);
  assert.ok(signals.typingPacingZScore > 0);
  assert.equal(signals.isCurrentlyPaused, false);
});

test("extractLearningSignals detects long idle pause", () => {
  const signals = extractLearningSignals({
    recentIntervals: [250, 260],
    baseline: { meanKeyInterval: 250, varianceKeyInterval: 4000 },
    backspaceCount: 0,
    totalKeys: 10,
    idleDurationMs: 3500,
  });

  assert.equal(signals.isCurrentlyPaused, true);
  assert.equal(signals.pauseDurationSec, 3.5);
});

test("savePersonalBaseline updates moving average without mutating input", () => {
  const initial = { meanKeyInterval: 200, varianceKeyInterval: 3000, totalInteractions: 10 };
  const updated = savePersonalBaseline(initial, [300, 320, 280]);

  assert.equal(initial.totalInteractions, 10);
  assert.ok(updated.meanKeyInterval > 200);
  assert.equal(updated.totalInteractions, 13);
});
