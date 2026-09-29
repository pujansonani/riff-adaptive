// retentionEngine.js
// Memory & Retention Engine: Adaptive Spaced Repetition, Flashcards,
// Retrieval Tracking, and Memory Health Metrics.

const RETENTION_STORAGE_KEY = "riff_recall_v1";

// Base Spaced Repetition interval steps in milliseconds
export const SPACING_INTERVALS_MS = [
  5 * 60 * 1000,           // Level 0: 5 minutes (immediate check)
  24 * 60 * 60 * 1000,     // Level 1: 1 day
  3 * 24 * 60 * 60 * 1000,  // Level 2: 3 days
  7 * 24 * 60 * 60 * 1000,  // Level 3: 7 days
  14 * 24 * 60 * 60 * 1000, // Level 4: 14 days
  30 * 24 * 60 * 60 * 1000, // Level 5: 30 days (permanent mastery)
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
        consecutiveSuccess: 0,
        scheduleReason: "Initial reinforcement after learning.",
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
      consecutiveSuccess: 0,
      scheduleReason: "Scheduled for initial review to consolidate memory.",
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
        status: c.status || "reviewing", // 'weak' | 'growing' | 'strong' | 'mastered'
        attempts: c.attempts || 0,
        correctCount: c.correctCount || 0,
        consecutiveSuccess: c.consecutiveSuccess || 0,
        scheduleReason: c.scheduleReason || "Scheduled for memory consolidation.",
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
 * Records the outcome of a flashcard / recall review with SMART ADAPTIVE SPACING.
 * Shortens interval on struggle; extends and accelerates on consecutive successes.
 */
export function recordCardReview(cardId, isCorrect, confidence = 0.8) {
  const store = loadRetentionStore();
  const now = Date.now();

  const updatedCards = store.cards.map((card) => {
    if (card.id !== cardId) return card;

    let nextLevel = card.level || 0;
    let nextStatus = card.status || "growing";
    let consecutiveSuccess = card.consecutiveSuccess || 0;
    let scheduleReason = "";

    if (isCorrect && confidence >= 0.6) {
      consecutiveSuccess += 1;
      // If student has multiple consecutive successes, accelerate progression
      const step = consecutiveSuccess >= 2 ? 2 : 1;
      nextLevel = Math.min(SPACING_INTERVALS_MS.length - 1, nextLevel + step);
      
      if (nextLevel >= 4) {
        nextStatus = "strong";
        scheduleReason = "Consistent mastery demonstrated; extended review interval.";
      } else {
        nextStatus = "growing";
        scheduleReason = `Recalled correctly with ${Math.round(confidence * 100)}% confidence; interval moved to Level ${nextLevel}.`;
      }
    } else {
      // Shorten interval on friction / struggle
      consecutiveSuccess = 0;
      nextLevel = 0; // Immediate 5-minute rescue
      nextStatus = "weak";
      scheduleReason = "Riff scheduled this quick review because this concept needs another retrieval attempt.";
    }

    const intervalMs = SPACING_INTERVALS_MS[nextLevel];
    const nextReviewTime = now + intervalMs;

    return {
      ...card,
      level: nextLevel,
      status: nextStatus,
      consecutiveSuccess,
      attempts: (card.attempts || 0) + 1,
      correctCount: (card.correctCount || 0) + (isCorrect ? 1 : 0),
      lastReviewed: now,
      nextReview: nextReviewTime,
      lastConfidence: confidence,
      scheduleReason,
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
  const strong = current.cards.filter((c) => c.status === "strong" || c.status === "mastered").length;
  const weak = current.cards.filter((c) => c.status === "weak").length;
  const growing = current.cards.filter((c) => c.status === "growing" || c.status === "reviewing").length;
  const due = getDueReviewCards(current).length;

  return {
    total,
    mastered: strong,
    strong,
    weak,
    growing,
    reviewing: growing,
    due,
    masteryPct: total > 0 ? Math.round((strong / total) * 100) : 0,
  };
}

/**
 * Memory Health summary for the dashboard.
 */
export function getMemoryHealthOverview(store) {
  const current = store || loadRetentionStore();
  const stats = getRetentionStats(current);
  
  // Find earliest next review timestamp
  const futureCards = current.cards.filter((c) => c.nextReview > Date.now());
  let nextReviewStr = "None scheduled";
  if (stats.due > 0) {
    nextReviewStr = "Due Now";
  } else if (futureCards.length > 0) {
    const earliest = Math.min(...futureCards.map((c) => c.nextReview));
    const diffHours = Math.round((earliest - Date.now()) / (1000 * 60 * 60));
    if (diffHours < 1) nextReviewStr = "In a few minutes";
    else if (diffHours < 24) nextReviewStr = `In ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    else nextReviewStr = "Tomorrow";
  }

  return {
    strongCount: stats.strong,
    growingCount: stats.growing,
    reviewCount: stats.due,
    nextReviewDateStr: nextReviewStr,
    totalCards: stats.total,
  };
}
