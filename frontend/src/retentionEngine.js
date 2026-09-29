// retentionEngine.js
// Memory & Retention Engine: Spaced repetition, flashcards, retrieval tracking,
// and weak-concept review using browser localStorage.

const RETENTION_STORAGE_KEY = "riff_recall_v1";

// Spaced Repetition interval steps in milliseconds
export const SPACING_INTERVALS_MS = [
  5 * 60 * 1000,          // Level 0: 5 minutes (immediate reinforcement)
  24 * 60 * 60 * 1000,    // Level 1: 1 day
  3 * 24 * 60 * 60 * 1000, // Level 2: 3 days
  7 * 24 * 60 * 60 * 1000, // Level 3: 7 days
  14 * 24 * 60 * 60 * 1000 // Level 4: 14 days
];

let inMemoryRetentionStore = { cards: [], history: [], lastCheck: Date.now() };

export function loadRetentionStore() {
  if (typeof window === "undefined" || !window.localStorage) {
    return inMemoryRetentionStore;
  }
  try {
    const raw = window.localStorage.getItem(RETENTION_STORAGE_KEY);
    if (!raw) return { cards: [], history: [], lastCheck: Date.now() };
    const data = JSON.parse(raw);
    return {
      cards: Array.isArray(data.cards) ? data.cards : [],
      history: Array.isArray(data.history) ? data.history : [],
      lastCheck: data.lastCheck || Date.now(),
    };
  } catch {
    return { cards: [], history: [], lastCheck: Date.now() };
  }
}

export function saveRetentionStore(store) {
  if (typeof window === "undefined" || !window.localStorage) {
    inMemoryRetentionStore = store;
    return store;
  }
  try {
    window.localStorage.setItem(RETENTION_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn("Failed to persist retention store", err);
  }
  return store;
}

/**
 * Deterministic fallback generator for flashcards when AI backend is unavailable.
 */
export function generateDeterministicFlashcards(lessonText, interest) {
  const clean = (lessonText || "").trim();
  const sentences = clean.split(/(?<=[.?!])\s+/).filter((s) => s.length > 15);
  const topicInterest = (interest || "everyday life").trim();

  if (sentences.length === 0) {
    return [
      {
        id: `card-${Date.now()}-1`,
        concept: "Core Concept",
        front: "What is the key idea of this lesson?",
        back: clean || "A fundamental building block of this topic.",
        hint: `Think about how this applies to ${topicInterest}.`,
        level: 0,
        nextReview: Date.now() + SPACING_INTERVALS_MS[0],
        lastReviewed: Date.now(),
        status: "reviewing",
        attempts: 0,
        correctCount: 0,
      },
    ];
  }

  return sentences.slice(0, 3).map((sent, idx) => {
    let question = `What happens here?`;
    let answer = sent;
    
    if (/represents|is called|means|defined as/i.test(sent)) {
      const parts = sent.split(/represents|is called|means|defined as/i);
      question = `What is ${parts[0].trim()}?`;
      answer = sent;
    } else if (idx === 0) {
      question = `What is the core definition in this lesson?`;
    } else if (idx === 1) {
      question = `How does this principle operate?`;
    } else {
      question = `Why is this principle important?`;
    }

    return {
      id: `card-${Date.now()}-${idx + 1}`,
      concept: `Key Idea #${idx + 1}`,
      front: question,
      back: answer,
      hint: `Remember the connection with ${topicInterest}.`,
      level: 0,
      nextReview: Date.now() + SPACING_INTERVALS_MS[0],
      lastReviewed: Date.now(),
      status: "reviewing",
      attempts: 0,
      correctCount: 0,
    };
  });
}

/**
 * Adds new cards from a lesson into the retention store without duplicates.
 */
export function addCardsToRetention(newCards) {
  const store = loadRetentionStore();
  const seenFronts = new Set(store.cards.map((c) => c.front.toLowerCase().trim()));
  const toAdd = [];

  for (const c of newCards) {
    const frontKey = (c.front || "").toLowerCase().trim();
    if (frontKey && !seenFronts.has(frontKey)) {
      seenFronts.add(frontKey);
      toAdd.push({
        id: c.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        concept: c.concept || "Key Concept",
        front: c.front,
        back: c.back,
        hint: c.hint || "",
        level: typeof c.level === "number" ? c.level : 0,
        nextReview: typeof c.nextReview === "number" ? c.nextReview : Date.now() + SPACING_INTERVALS_MS[0],
        lastReviewed: Date.now(),
        status: c.status || "reviewing", // 'weak' | 'reviewing' | 'mastered'
        attempts: c.attempts || 0,
        correctCount: c.correctCount || 0,
      });
    }
  }

  const updatedStore = {
    ...store,
    cards: [...toAdd, ...store.cards],
  };

  saveRetentionStore(updatedStore);
  return updatedStore;
}

/**
 * Returns cards currently due for review or weak.
 */
export function getDueReviewCards(store) {
  const current = store || loadRetentionStore();
  const now = Date.now();
  return current.cards.filter((card) => card.nextReview <= now || card.status === "weak");
}

/**
 * Records the outcome of a flashcard / recall review.
 * @param {string} cardId
 * @param {boolean} isCorrect - whether the student recalled correctly
 * @param {number} confidence - learner's self-reported or evaluated confidence (0 to 1)
 */
export function recordCardReview(cardId, isCorrect, confidence = 0.8) {
  const store = loadRetentionStore();
  const now = Date.now();

  const updatedCards = store.cards.map((card) => {
    if (card.id !== cardId) return card;

    let nextLevel = card.level;
    let nextStatus = card.status;

    if (isCorrect && confidence >= 0.6) {
      nextLevel = Math.min(SPACING_INTERVALS_MS.length - 1, card.level + 1);
      nextStatus = nextLevel >= 3 ? "mastered" : "reviewing";
    } else {
      // Step back to Level 0 on struggle
      nextLevel = 0;
      nextStatus = "weak";
    }

    const intervalMs = SPACING_INTERVALS_MS[nextLevel];
    const nextReviewTime = now + intervalMs;

    return {
      ...card,
      level: nextLevel,
      status: nextStatus,
      attempts: (card.attempts || 0) + 1,
      correctCount: (card.correctCount || 0) + (isCorrect ? 1 : 0),
      lastReviewed: now,
      nextReview: nextReviewTime,
      lastConfidence: confidence,
    };
  });

  const reviewEvent = {
    cardId,
    timestamp: now,
    isCorrect,
    confidence,
  };

  const updatedStore = {
    ...store,
    cards: updatedCards,
    history: [reviewEvent, ...(store.history || []).slice(0, 49)],
  };

  saveRetentionStore(updatedStore);
  return updatedStore;
}

/**
 * Aggregates high-level retention stats for display.
 */
export function getRetentionStats(store) {
  const current = store || loadRetentionStore();
  const total = current.cards.length;
  const mastered = current.cards.filter((c) => c.status === "mastered").length;
  const weak = current.cards.filter((c) => c.status === "weak").length;
  const reviewing = current.cards.filter((c) => c.status === "reviewing").length;
  const due = getDueReviewCards(current).length;

  return {
    total,
    mastered,
    weak,
    reviewing,
    due,
    masteryPct: total > 0 ? Math.round((mastered / total) * 100) : 0,
  };
}
