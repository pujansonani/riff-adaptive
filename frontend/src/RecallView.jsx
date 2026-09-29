// RecallView.jsx
// Friendly "Can You Remember?" memory game for kids & teens.
// Uses gentle encouragement: "I know it", "Almost", "Not yet".

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
    <div className="w-full p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#FF5E7E] px-3 py-1 rounded-full bg-[#FFE0E5]">
            🧠 MEMORY BUDDY
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#263238] mt-2">
            Can You Remember?
          </h3>
          <p className="text-[#546E7A] text-xs sm:text-sm mt-1">
            Quick fun check-ins to make sure ideas stick in your brain!
          </p>
        </div>

        {/* Friendly Overview Badges */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#FFF9F0] border border-[#E8DEFF]">
          <div className="px-3 py-1 bg-white rounded-xl shadow-sm text-center">
            <span className="font-display text-base font-bold text-[#2EC4B6] block">{memoryHealth.strongCount}</span>
            <span className="text-[10px] font-bold text-[#546E7A]">Nailed It!</span>
          </div>
          <div className="px-3 py-1 bg-white rounded-xl shadow-sm text-center">
            <span className="font-display text-base font-bold text-[#FFB84D] block">{memoryHealth.growingCount}</span>
            <span className="text-[10px] font-bold text-[#546E7A]">Growing</span>
          </div>
          <div className="px-3 py-1 bg-white rounded-xl shadow-sm text-center">
            <span className="font-display text-base font-bold text-[#FF5E7E] block">{stats.due}</span>
            <span className="text-[10px] font-bold text-[#546E7A]">Ready to Play</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E8DEFF] pb-3">
        <button
          onClick={() => {
            setActiveTab("flashcards");
            setIsFlipped(false);
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "flashcards"
              ? "bg-[#6C63FF] text-white shadow-bouncy-purple"
              : "bg-[#FFF9F0] hover:bg-[#FFF3D6] text-[#546E7A]"
          }`}
        >
          🗂️ Memory Cards {cards.length > 0 && `(${cards.length})`}
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "queue"
              ? "bg-[#6C63FF] text-white shadow-bouncy-purple"
              : "bg-[#FFF9F0] hover:bg-[#FFF3D6] text-[#546E7A]"
          }`}
        >
          ⏰ Review List ({stats.due} ready)
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "quiz"
              ? "bg-[#6C63FF] text-white shadow-bouncy-purple"
              : "bg-[#FFF9F0] hover:bg-[#FFF3D6] text-[#546E7A]"
          }`}
        >
          ⚡ Fun Mini-Quiz
        </button>
      </div>

      {/* Tab 1: Memory Cards */}
      {activeTab === "flashcards" && (
        <div className="flex flex-col items-center">
          {cards.length === 0 && dueCards.length === 0 ? (
            <div className="p-8 text-center bg-[#FFF9F0] border-2 border-dashed border-[#E8DEFF] rounded-3xl w-full max-w-md">
              <span className="text-4xl block mb-2">✨</span>
              <p className="text-sm font-bold text-[#263238] mb-4">No cards made for this lesson yet!</p>
              <button
                onClick={onGenerateCards}
                disabled={isGenerating}
                className="px-6 py-3 rounded-full bg-[#6C63FF] text-white text-xs font-bold shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none"
              >
                {isGenerating ? "Making Cards..." : "Make Memory Cards"}
              </button>
            </div>
          ) : currentCard ? (
            <div className="w-full max-w-lg flex flex-col items-center">
              <span className="text-xs font-bold text-[#546E7A] mb-3">
                Card {cardIndex + 1} of {cards.length || dueCards.length}
              </span>

              {/* Cheerful 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full h-72 rounded-[36px] p-8 border-2 transition-all duration-300 cursor-pointer relative shadow-card flex flex-col justify-between select-none ${
                  isFlipped
                    ? "bg-gradient-to-b from-[#DFF7F0] to-white border-[#2EC4B6]"
                    : "bg-gradient-to-b from-[#FFF3D6] to-white border-[#FFB84D]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#534BD6] px-3 py-1 rounded-full bg-white/80 shadow-sm">
                    {currentCard.concept || "Idea"}
                  </span>
                  <span className="text-xs font-bold text-[#546E7A]">Tap to see answer ↻</span>
                </div>

                <div className="text-center font-display text-2xl sm:text-3xl text-[#263238] font-bold leading-relaxed my-auto">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>

                {isFlipped && currentCard.hint && (
                  <div className="text-xs text-[#2EC4B6] font-bold bg-white/80 p-2.5 rounded-2xl text-center border border-[#DFF7F0]">
                    💡 {currentCard.hint}
                  </div>
                )}
              </div>

              {/* Friendly Rating Buttons */}
              {isFlipped && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <span className="text-xs font-bold text-[#546E7A]">How did you do?</span>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleCardOutcome(false, 0.2)}
                      className="px-5 py-2.5 rounded-full bg-[#FFE0E5] hover:bg-[#FFCCD5] text-[#FF5E7E] text-xs font-bold transition-all shadow-sm"
                    >
                      Not yet 🤔
                    </button>
                    <button
                      onClick={() => handleCardOutcome(true, 0.6)}
                      className="px-5 py-2.5 rounded-full bg-[#FFF3D6] hover:bg-[#FFE6A3] text-[#E08A00] text-xs font-bold transition-all shadow-sm"
                    >
                      Almost ✨
                    </button>
                    <button
                      onClick={() => handleCardOutcome(true, 0.95)}
                      className="px-5 py-2.5 rounded-full bg-[#DFF7F0] hover:bg-[#C2F2E4] text-[#20A396] text-xs font-bold transition-all shadow-sm"
                    >
                      I know it! 🎉
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 2: Queue */}
      {activeTab === "queue" && (
        <div className="space-y-3">
          {(cards.length > 0 ? cards : dueCards).map((card) => {
            const isDue = card.nextReview <= Date.now() || card.status === "weak";
            return (
              <div
                key={card.id}
                className="p-4 rounded-3xl bg-[#FFF9F0] border border-[#E8DEFF] flex items-center justify-between gap-4"
              >
                <div>
                  <strong className="text-sm font-display text-[#263238] block">{card.front}</strong>
                  <span className="text-xs text-[#546E7A]">{card.back}</span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isDue ? "bg-[#FFE0E5] text-[#FF5E7E]" : "bg-[#DFF7F0] text-[#20A396]"
                  }`}
                >
                  {isDue ? "Ready to practice" : "Remembered"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Fun Quiz */}
      {activeTab === "quiz" && (
        <div className="space-y-4">
          {(cards.length > 0 ? cards.slice(0, 3) : dueCards.slice(0, 3)).map((card, idx) => (
            <div key={card.id} className="p-5 rounded-3xl bg-[#FFF9F0] border border-[#E8DEFF] space-y-2">
              <span className="text-xs font-bold text-[#6C63FF] uppercase block">
                Question {idx + 1}
              </span>
              <p className="text-sm font-display font-bold text-[#263238]">{card.front}</p>
              <textarea
                rows={2}
                placeholder="Type your answer here..."
                value={quizAnswers[card.id] || ""}
                onChange={(e) => setQuizAnswers({ ...quizAnswers, [card.id]: e.target.value })}
                className="w-full bg-white border border-[#E8DEFF] rounded-2xl p-3 text-xs text-[#263238] font-bold focus:outline-none focus:border-[#6C63FF]"
              />
              {quizSubmitted && (
                <div className="mt-2 text-xs text-[#20A396] font-bold bg-[#DFF7F0] p-3 rounded-2xl border border-[#DFF7F0]">
                  <strong>Awesome try! Riff's note:</strong> {card.back}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2">
            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                className="px-6 py-3 rounded-full bg-[#6C63FF] text-white text-xs font-bold shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none"
              >
                Check My Answers ✨
              </button>
            ) : (
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className="px-6 py-3 rounded-full bg-white border-2 border-[#E8DEFF] text-[#263238] text-xs font-bold hover:bg-[#FFF3D6]"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
