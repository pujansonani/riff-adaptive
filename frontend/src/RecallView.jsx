// RecallView.jsx
// Memory & Retention Engine Component:
// Interactive Flashcards, Spaced Repetition queue, and Quick Recall mini-tests.

import { useState } from "react";
import {
  getDueReviewCards,
  recordCardReview,
  getRetentionStats,
} from "./retentionEngine.js";

export default function RecallView({
  cards = [],
  onGenerateCards,
  isGenerating = false,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState("flashcards"); // flashcards | queue | quiz
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const stats = getRetentionStats();
  const dueCards = getDueReviewCards();
  const currentCard = cards[cardIndex] || dueCards[cardIndex] || null;

  const handleCardOutcome = (isCorrect, confidence) => {
    if (!currentCard) return;
    recordCardReview(currentCard.id, isCorrect, confidence);
    setIsFlipped(false);
    if (cardIndex < cards.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCardIndex(0);
    }
    if (onRefresh) onRefresh();
  };

  return (
    <div className="riff-recall-container">
      <div className="riff-recall-header">
        <div>
          <span className="riff-panel-label" style={{ margin: 0 }}>
            Memory & Spaced Retrieval Engine
          </span>
          <p className="riff-recall-subtitle">
            Long-term retention via active recall and spaced intervals (5m → 1d → 3d → 7d → 14d).
          </p>
        </div>

        <div className="riff-recall-stats-pills">
          <div className="riff-stat-pill">
            <span className="stat-num">{stats.due}</span>
            <span className="stat-lbl">Due Now</span>
          </div>
          <div className="riff-stat-pill">
            <span className="stat-num">{stats.mastered}</span>
            <span className="stat-lbl">Mastered</span>
          </div>
          <div className="riff-stat-pill">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-lbl">Total Tracked</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="riff-recall-tabs">
        <button
          className={`riff-tab-btn ${activeTab === "flashcards" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("flashcards");
            setIsFlipped(false);
          }}
        >
          🗂️ Flashcards {cards.length > 0 && `(${cards.length})`}
        </button>
        <button
          className={`riff-tab-btn ${activeTab === "queue" ? "active" : ""}`}
          onClick={() => setActiveTab("queue")}
        >
          ⏰ Spaced Queue ({stats.due} due)
        </button>
        <button
          className={`riff-tab-btn ${activeTab === "quiz" ? "active" : ""}`}
          onClick={() => setActiveTab("quiz")}
        >
          ⚡ Quick Recall Test
        </button>
      </div>

      {/* Tab 1: Flashcards */}
      {activeTab === "flashcards" && (
        <div className="riff-flashcard-section">
          {cards.length === 0 && dueCards.length === 0 ? (
            <div className="riff-empty-cards">
              <p>No flashcards generated for this topic yet.</p>
              <button
                className="riff-btn-small accept"
                onClick={onGenerateCards}
                disabled={isGenerating}
              >
                {isGenerating ? "Creating Flashcards..." : "✨ Generate Lesson Flashcards"}
              </button>
            </div>
          ) : currentCard ? (
            <div className="riff-card-interactive-box">
              <div className="riff-card-counter">
                Card {cardIndex + 1} of {cards.length || dueCards.length} • Level {currentCard.level || 0}
              </div>

              <div
                className={`riff-flashcard-3d ${isFlipped ? "flipped" : ""}`}
                onClick={() => setIsFlipped(!isFlipped)}
                role="button"
                tabIndex={0}
                aria-label="Flip flashcard"
              >
                <div className="riff-card-face front">
                  <span className="card-badge">{currentCard.concept || "Concept"}</span>
                  <div className="card-text">{currentCard.front}</div>
                  <div className="card-flip-prompt">Click to flip & see answer ↻</div>
                </div>

                <div className="riff-card-face back">
                  <span className="card-badge success">Answer</span>
                  <div className="card-text">{currentCard.back}</div>
                  {currentCard.hint && <div className="card-hint">💡 {currentCard.hint}</div>}
                </div>
              </div>

              {/* Assessment buttons when flipped */}
              {isFlipped && (
                <div className="riff-card-rating-row">
                  <span className="rating-label">How well did you recall this?</span>
                  <div className="rating-buttons">
                    <button
                      className="riff-btn-small dismiss"
                      onClick={() => handleCardOutcome(false, 0.3)}
                    >
                      🤔 Still Learning (Review in 5m)
                    </button>
                    <button
                      className="riff-btn-small accept"
                      onClick={() => handleCardOutcome(true, 0.9)}
                    >
                      🎯 Got it! (Advance Spaced Interval)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 2: Spaced Queue */}
      {activeTab === "queue" && (
        <div className="riff-queue-section">
          <div className="riff-queue-header">
            <span>Spaced Repetition Schedule (SuperMemo Leitner intervals)</span>
          </div>

          <div className="riff-interval-timeline">
            {[
              { level: 0, label: "5 Min", desc: "Immediate Check" },
              { level: 1, label: "1 Day", desc: "Short-term Consolidate" },
              { level: 2, label: "3 Days", desc: "Medium-term" },
              { level: 3, label: "7 Days", desc: "Long-term Storage" },
              { level: 4, label: "14 Days", desc: "Mastered" },
            ].map((slot) => (
              <div key={slot.level} className="riff-timeline-slot">
                <div className="slot-badge">L{slot.level}</div>
                <div className="slot-title">{slot.label}</div>
                <div className="slot-desc">{slot.desc}</div>
              </div>
            ))}
          </div>

          <div className="riff-card-list">
            {(cards.length > 0 ? cards : dueCards).map((card) => {
              const isDue = card.nextReview <= Date.now() || card.status === "weak";
              return (
                <div key={card.id} className={`riff-card-list-item ${isDue ? "due" : ""}`}>
                  <div className="item-info">
                    <strong>{card.front}</strong>
                    <span className="item-answer">{card.back}</span>
                  </div>
                  <div className="item-meta">
                    <span className={`status-badge ${card.status || "reviewing"}`}>
                      {isDue ? "⚠️ Review Due" : `Level ${card.level || 0}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Quick Recall Quiz */}
      {activeTab === "quiz" && (
        <div className="riff-quiz-flow">
          <div className="riff-quiz-intro">
            <p>Active retrieval is the most effective retention driver. Answer in your own words:</p>
          </div>

          {(cards.length > 0 ? cards.slice(0, 3) : dueCards.slice(0, 3)).map((card, idx) => (
            <div key={card.id} className="riff-quiz-item">
              <span className="quiz-q-num">Question {idx + 1}</span>
              <div className="quiz-q-text">{card.front}</div>
              <textarea
                rows={2}
                placeholder="Write what you remember..."
                value={quizAnswers[card.id] || ""}
                onChange={(e) =>
                  setQuizAnswers({ ...quizAnswers, [card.id]: e.target.value })
                }
              />
              {quizSubmitted && (
                <div className="quiz-q-solution">
                  <strong>Expected:</strong> {card.back}
                </div>
              )}
            </div>
          ))}

          <div className="riff-quiz-actions">
            {!quizSubmitted ? (
              <button
                className="riff-btn-small accept"
                onClick={() => setQuizSubmitted(true)}
              >
                Submit Recall Answers
              </button>
            ) : (
              <button
                className="riff-btn-small ghost"
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
              >
                Reset Mini-Test
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
