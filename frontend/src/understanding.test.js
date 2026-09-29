import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateUnderstanding } from './understanding.js';

test('returns a high confidence score when the answer covers the main idea', () => {
  const lesson = 'A fraction represents a part of a whole.';
  const answer = 'A fraction is a part of a whole, with the top number showing how many parts you have.';
  const result = evaluateUnderstanding(answer, lesson, 'pizza');

  assert.ok(result.confidence >= 0.6);
  assert.match(result.feedback, /confidence/i);
});

test('returns a low confidence score for a vague answer', () => {
  const lesson = 'A fraction represents a part of a whole.';
  const result = evaluateUnderstanding('It is about math.', lesson, 'pizza');

  assert.ok(result.confidence < 0.5);
  assert.match(result.feedback, /needs/i);
});

test('treats gibberish as low confidence', () => {
  const lesson = 'A fraction represents a part of a whole.';
  const result = evaluateUnderstanding('asdf qwer zxcv', lesson, 'pizza');

  assert.ok(result.confidence < 0.3);
  assert.match(result.feedback, /low|needs/i);
});
