import test from "node:test";
import assert from "node:assert/strict";
import {
  generateDeterministicFlashcards,
  addCardsToRetention,
  recordCardReview,
  getDueReviewCards,
  getRetentionStats,
  SPACING_INTERVALS_MS,
} from "./retentionEngine.js";

test("generateDeterministicFlashcards creates structured flashcards from text", () => {
  const lesson = "Photosynthesis is the process by which plants use sunlight to make food. The green pigment chlorophyll absorbs light.";
  const cards = generateDeterministicFlashcards(lesson, "soccer");

  assert.ok(cards.length >= 2);
  assert.ok(cards[0].front);
  assert.ok(cards[0].back);
  assert.match(cards[0].hint, /soccer/i);
});

test("addCardsToRetention adds new cards and prevents exact duplicates", () => {
  const cardA = { front: "What is 2+2?", back: "4", concept: "Math" };
  const cardB = { front: "What is 2+2?", back: "4", concept: "Math" };

  const store = addCardsToRetention([cardA, cardB]);
  const matched = store.cards.filter((c) => c.front.toLowerCase() === "what is 2+2?");
  assert.equal(matched.length, 1);
});

test("recordCardReview advances spacing level on correct recall", () => {
  const sampleCard = { id: "test-card-1", front: "Question?", back: "Answer", level: 0, nextReview: Date.now() };
  addCardsToRetention([sampleCard]);

  const updatedStore = recordCardReview("test-card-1", true, 0.9);
  const card = updatedStore.cards.find((c) => c.id === "test-card-1");

  assert.equal(card.level, 1);
  assert.ok(card.nextReview > Date.now());
});

test("recordCardReview resets to level 0 on struggle", () => {
  const sampleCard = { id: "test-card-2", front: "Hard Question?", back: "Answer", level: 3, nextReview: Date.now() };
  addCardsToRetention([sampleCard]);

  const updatedStore = recordCardReview("test-card-2", false, 0.2);
  const card = updatedStore.cards.find((c) => c.id === "test-card-2");

  assert.equal(card.level, 0);
  assert.equal(card.status, "weak");
});
