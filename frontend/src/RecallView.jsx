// RecallView.jsx
// Memory & Retention Engine Component with dark cinematic cards.

import { useState } from "react";
import {
  getDueReviewCards,
  recordCardReview,
  getRetentionStats,
  getMemoryHealthOverview,
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
  const memoryHealth = getMemoryHealthOverview();
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
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-400 font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Memory & Spaced Retrieval
          </span>
          <h3 className="font-serif text-3xl text-white font-normal mt-2">
            RiffRecall Engine
          </h3>
          <p className="text-white/50 text-xs mt-1">
            Active recall intervals dynamically adjusted based on retention performance (5m → 1d → 3d → 7d → 14d).
          </p>
        </div>

        {/* Memory Health Overview Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="text-center px-2">
            <span className="font-mono text-base font-bold text-rose-400 block">{stats.due}</span>
            <span className="font-mono text-[9px] uppercase text-white/40">Due Now</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-center px-2">
            <span className="font-mono text-base font-bold text-emerald-400 block">{memoryHealth.strongCount}</span>
            <span className="font-mono text-[9px] uppercase text-white/40">Strong</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-center px-2">
            <span className="font-mono text-base font-bold text-indigo-300 block">{memoryHealth.growingCount}</span>
            <span className="font-mono text-[9px] uppercase text-white/40">Growing</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3 mb-6">
        <button
          onClick={() => {
            setActiveTab("flashcards");
            setIsFlipped(false);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === "flashcards"
              ? "bg-white text-black"
              : "bg-white/5 hover:bg-white/10 text-white/70"
          }`}
        >
          🗂️ Flashcards {cards.length > 0 && `(${cards.length})`}
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === "queue"
              ? "bg-white text-black"
              : "bg-white/5 hover:bg-white/10 text-white/70"
          }`}
        >
          ⏰ Spaced Queue ({stats.due} due)
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === "quiz"
              ? "bg-white text-black"
              : "bg-white/5 hover:bg-white/10 text-white/70"
          }`}
        >
          ⚡ Quick Recall Test
        </button>
      </div>

      {/* Tab 1: Flashcards */}
      {activeTab === "flashcards" && (
        <div className="flex flex-col items-center">
          {cards.length === 0 && dueCards.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.02] border border-white/10 rounded-2xl w-full max-w-md">
              <p className="text-sm text-white/60 mb-4">No flashcards generated for this topic yet.</p>
              <button
                onClick={onGenerateCards}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 shadow-xl shadow-white/10"
              >
                {isGenerating ? "Generating..." : "✨ Generate Lesson Flashcards"}
              </button>
            </div>
          ) : currentCard ? (
            <div className="w-full max-w-xl flex flex-col items-center">
              <span className="font-mono text-xs text-white/40 mb-3">
                Card {cardIndex + 1} of {cards.length || dueCards.length} • Level {currentCard.level || 0}
              </span>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full h-72 rounded-3xl p-8 border transition-all duration-500 cursor-pointer relative shadow-2xl flex flex-col justify-between select-none ${
                  isFlipped
                    ? "bg-gradient-to-br from-emerald-950/40 via-[#0d1612] to-[#070b09] border-emerald-400/50 shadow-emerald-500/10"
                    : "bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent border-white/15"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-300 font-bold px-2.5 py-1 rounded bg-white/10">
                    {currentCard.concept || "Key Idea"}
                  </span>
                  <span className="font-mono text-[10px] text-white/40">Tap to flip ↻</span>
                </div>

                <div className="text-center font-serif text-2xl text-white font-normal leading-relaxed my-auto">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>

                {isFlipped && currentCard.hint && (
                  <div className="text-xs text-emerald-300/80 bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-xl text-center">
                    💡 {currentCard.hint}
                  </div>
                )}
              </div>

              {/* Recall Self-Assessment Buttons */}
              {isFlipped && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <span className="text-xs text-white/50">How well did you recall this concept?</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCardOutcome(false, 0.3)}
                      className="px-5 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold"
                    >
                      🤔 Still Learning (Review in 5m)
                    </button>
                    <button
                      onClick={() => handleCardOutcome(true, 0.9)}
                      className="px-5 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                    >
                      🎯 Got It! (Advance Spacing)
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
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { level: 0, label: "5 Min", desc: "Immediate Check" },
              { level: 1, label: "1 Day", desc: "Short-term" },
              { level: 2, label: "3 Days", desc: "Consolidation" },
              { level: 3, label: "7 Days", desc: "Long-term" },
              { level: 4, label: "14 Days", desc: "Mastered" },
            ].map((slot) => (
              <div key={slot.level} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="font-mono text-xs font-bold text-indigo-400 block">L{slot.level}</span>
                <strong className="text-xs text-white block mt-1">{slot.label}</strong>
                <span className="text-[10px] text-white/40">{slot.desc}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {(cards.length > 0 ? cards : dueCards).map((card) => {
              const isDue = card.nextReview <= Date.now() || card.status === "weak";
              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    isDue ? "bg-rose-950/20 border-rose-500/40" : "bg-white/[0.02] border-white/10"
                  }`}
                >
                  <div>
                    <strong className="text-sm text-white block">{card.front}</strong>
                    <span className="text-xs text-white/50">{card.back}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                      isDue ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-white/60"
                    }`}
                  >
                    {isDue ? "⚠️ Review Due" : `Level ${card.level || 0}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Quick Recall Quiz */}
      {activeTab === "quiz" && (
        <div className="space-y-4">
          {(cards.length > 0 ? cards.slice(0, 3) : dueCards.slice(0, 3)).map((card, idx) => (
            <div key={card.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold block mb-1">
                Question {idx + 1}
              </span>
              <p className="text-sm font-semibold text-white mb-2">{card.front}</p>
              <textarea
                rows={2}
                placeholder="Write what you remember..."
                value={quizAnswers[card.id] || ""}
                onChange={(e) => setQuizAnswers({ ...quizAnswers, [card.id]: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
              {quizSubmitted && (
                <div className="mt-2 text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                  <strong>Expected Answer:</strong> {card.back}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2">
            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90"
              >
                Submit Recall Answers
              </button>
            ) : (
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
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
