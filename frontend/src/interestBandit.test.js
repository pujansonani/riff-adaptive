import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseArm, updateStats, bestArmInsight, computeBanditReward } from './interestBandit.js';

test('explores every arm at least once before it starts exploiting', () => {
  const arms = ['space', 'sports', 'gaming'];
  let stats = {};
  const seen = new Set();
  const random = () => 0; // always take the first candidate

  for (let i = 0; i < arms.length; i++) {
    const arm = chooseArm(stats, arms, { random });
    seen.add(arm);
    stats = updateStats(stats, arm, 0.5);
  }

  assert.equal(seen.size, arms.length);
});

test('exploits the arm with the higher average reward once every arm has data', () => {
  let stats = {};
  stats = updateStats(stats, 'space', 0.9);
  stats = updateStats(stats, 'sports', 0.2);

  const random = () => 0.99; // above epsilon, so no random exploration this pull
  const arm = chooseArm(stats, ['space', 'sports'], { random });

  assert.equal(arm, 'space');
});

test('updateStats accumulates pulls and reward without mutating the input', () => {
  const before = { space: { pulls: 1, totalReward: 0.5 } };
  const after = updateStats(before, 'space', 0.5);

  assert.deepEqual(before, { space: { pulls: 1, totalReward: 0.5 } });
  assert.deepEqual(after, { space: { pulls: 2, totalReward: 1.0 } });
});

test('bestArmInsight stays quiet until there is enough evidence', () => {
  const insight = bestArmInsight({ space: { pulls: 1, totalReward: 0.8 } }, 2);
  assert.equal(insight, null);
});

test('bestArmInsight surfaces the strongest arm once the minimum is met', () => {
  const stats = {
    space: { pulls: 3, totalReward: 2.4 },
    sports: { pulls: 3, totalReward: 0.9 },
  };
  const insight = bestArmInsight(stats, 2);
  assert.equal(insight.arm, 'space');
  assert.ok(Math.abs(insight.average - 0.8) < 0.001);
});

test('computeBanditReward rewards not needing a hint and staying engaged', () => {
  const noHintFast = computeBanditReward({ confidence: 0.6, usedHint: false, timeToSubmitMs: 10000 });
  const hintSlow = computeBanditReward({ confidence: 0.6, usedHint: true, timeToSubmitMs: 90000 });
  assert.ok(noHintFast > hintSlow);
});

test('computeBanditReward stays within its 0 to 1.25 bounds', () => {
  const reward = computeBanditReward({ confidence: 1, usedHint: false, timeToSubmitMs: 1000 });
  assert.ok(reward <= 1.25);
  assert.ok(reward >= 0);
});
