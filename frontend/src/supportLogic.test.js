import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSupportState } from './supportLogic.js';

test('does not offer support for a normal typing pattern', () => {
  const state = evaluateSupportState({ backspaceRatio: 0.05, deviationPct: 10, recentAvg: 180, rapidChanges: 0 }, 12);
  assert.equal(state.shouldOffer, false);
});

test('offers support only when multiple strong signals appear', () => {
  const state = evaluateSupportState({ backspaceRatio: 0.2, deviationPct: 60, recentAvg: 1000, rapidChanges: 2 }, 20);
  assert.equal(state.shouldOffer, true);
});
