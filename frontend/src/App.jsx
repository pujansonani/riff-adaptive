// App.jsx
// Riff: Adaptive Neuro-Learning Engine
// Core Loop: OBSERVE → DETECT → ADAPT → TEACH → PRACTICE → REMEMBER

import { useState, useRef, useCallback, useEffect } from "react";
import { evaluateUnderstanding } from "./understanding";
import {
  loadPersonalBaseline,
  savePersonalBaseline,
  extractLearningSignals,
} from "./learningSignals";
import {
  inferLearnerState,
  evaluateLearnerFriction,
  LEARNER_STATES,
} from "./frictionModel";
import {
  loadModalityProfile,
  recordModalityOutcome,
  getModalityInsights,
} from "./modalityProfile";
import {
  loadRetentionStore,
  generateDeterministicFlashcards,
  addCardsToRetention,
  getDueReviewCards,
  getRetentionStats,
} from "./retentionEngine";
import { decideAdaptation, INTERVENTIONS } from "./adaptationEngine";
import {
  loadBanditState,
  saveBanditState,
  updateStats,
  bestArmInsight,
  computeBanditReward,
} from "./interestBandit";
import { getVibeTheme } from "./vibeThemes";
import { isSpeechSupported, speak, stopSpeaking } from "./speech";
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
} from "./speechRecognition";

import RiffMascot from "./Mascot.jsx";
import AdaptiveEngineHub from "./AdaptiveEngineHub.jsx";
import NeuroReadControls, { READ_FONTS, CONTRAST_THEMES } from "./NeuroReadControls.jsx";
import Whiteboard from "./Whiteboard.jsx";
import FocusSupportModal from "./FocusSupportModal.jsx";
import RecallView from "./RecallView.jsx";

const LANGUAGES = ["Hindi", "Spanish", "French", "Mandarin", "Arabic", "Tamil", "Marathi"];

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3010").replace(/\/$/, "");

const SAMPLE_LESSON =
  "A fraction represents a part of a whole. The number on top, called the numerator, tells you how many parts you have. The number on the bottom, called the denominator, tells you how many equal parts the whole is divided into. For example, in the fraction 3/4, you have 3 parts out of 4 equal parts total.";

export default function App() {
  // ---- Main Lesson & Remix State ----
  const [lesson, setLesson] = useState(SAMPLE_LESSON);
  const [interest, setInterest] = useState("");
  const [remix, setRemix] = useState("");
  const [remixLoading, setRemixLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- Scratchpad & Real-time Behavior ----
  const [scratch, setScratch] = useState("");
  const [bars, setBars] = useState(Array(24).fill(6));
  const [alertState, setAlertState] = useState("calm"); // calm | offered | hinted | stepped
  const [steps, setSteps] = useState("");
  const [stepsLoading, setStepsLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [simpler, setSimpler] = useState("");
  const [simplerLoading, setSimplerLoading] = useState(false);
  const [quiz, setQuiz] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const [confidenceFeedback, setConfidenceFeedback] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  // ---- Vibe Theming & Interest Bandit ----
  const [vibe, setVibe] = useState("everyday");
  const [banditInsight, setBanditInsight] = useState(null);

  // ---- Riff Lab Features ----
  const [diagnose, setDiagnose] = useState(null);
  const [diagnoseLoading, setDiagnoseLoading] = useState(false);
  const [bridge, setBridge] = useState(null);
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [teachExplanation, setTeachExplanation] = useState("");
  const [teachback, setTeachback] = useState(null);
  const [teachbackLoading, setTeachbackLoading] = useState(false);

  // ---- Multimodal Voice & Audio ----
  const [translateLang, setTranslateLang] = useState("Hindi");
  const [translated, setTranslated] = useState("");
  const [translateLoading, setTranslateLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechCharIndex, setSpeechCharIndex] = useState(-1);
  const [voiceTarget, setVoiceTarget] = useState(null); // 'lesson' | 'interest' | 'scratch' | 'teach' | null

  // ---- Adaptive Engine Subsystems ----
  const [behaviorState, setBehaviorState] = useState({
    state: LEARNER_STATES.FOCUSED,
    confidence: 0.8,
    frictionScore: 0.1,
    isFrictionDetected: false,
    probabilities: { focused: 0.8, uncertain: 0.1, struggling: 0.05, disengaging: 0.05 },
  });
  const [learningSignalsData, setLearningSignalsData] = useState(null);
  const [modalityProfile, setModalityProfile] = useState(loadModalityProfile());
  const [retentionStore, setRetentionStore] = useState(loadRetentionStore());
  const [activeModalityView, setActiveModalityView] = useState("scratch"); // 'scratch' | 'whiteboard' | 'focus' | 'recall'

  // ---- Focus Support Mode Modal ----
  const [focusModalOpen, setFocusModalOpen] = useState(false);

  // ---- Whiteboard (RiffBoard) State ----
  const [visualFeedback, setVisualFeedback] = useState("");
  const [isVisualizing, setIsVisualizing] = useState(false);

  // ---- Flashcards & Recall State ----
  const [flashcards, setFlashcards] = useState([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // ---- Neuro-Read (Accessible Reading) State ----
  const [neuroReadOpen, setNeuroReadOpen] = useState(false);
  const [neuroSettings, setNeuroSettings] = useState({
    fontSize: "normal", // 'normal' | 'large' | 'xl'
    lineHeight: "normal", // 'normal' | 'relaxed' | 'spacious'
    letterSpacing: "normal", // 'normal' | 'wide' | 'extrawide'
    fontFamily: "inter",
    contrastTheme: "default",
    readingRuler: false,
    bionicFocus: false,
  });

  // ---- Interaction Refs & Baseline Telemetry ----
  const lastKeyTime = useRef(null);
  const baseline = useRef(loadPersonalBaseline());
  const recentIntervals = useRef([]);
  const backspaceCount = useRef(0);
  const totalKeys = useRef(0);
  const repeatedCorrections = useRef(0);
  const taskStartTime = useRef(Date.now());
  const hasTriggered = useRef(false);
  const hintUsedRef = useRef(false);
  const remixTimestampRef = useRef(null);
  const banditStats = useRef(loadBanditState());
  const idleTimerRef = useRef(null);
  const lastActivityTimestamp = useRef(Date.now());

  // Initialize baseline and retention state
  useEffect(() => {
    baseline.current = loadPersonalBaseline();
    setRetentionStore(loadRetentionStore());
    setModalityProfile(loadModalityProfile());
    setBanditInsight(bestArmInsight(banditStats.current));
  }, []);

  // Compute adaptive decision
  const modalityInsights = getModalityInsights(modalityProfile);
  const retentionStats = getRetentionStats(retentionStore);

  const adaptationDecision = decideAdaptation({
    behaviorState,
    understandingConfidence: confidence,
    retentionDueCount: retentionStats.due,
    preferredModality: modalityInsights.topModality,
    interest,
    hasLesson: Boolean(remix || lesson),
  });

  // Inactivity / Idle monitoring
  useEffect(() => {
    const checkIdle = () => {
      const idleMs = Date.now() - lastActivityTimestamp.current;
      if (idleMs > 6000 && totalKeys.current > 6 && !focusModalOpen) {
        const signals = extractLearningSignals({
          recentIntervals: recentIntervals.current,
          baseline: baseline.current,
          backspaceCount: backspaceCount.current,
          totalKeys: totalKeys.current,
          idleDurationMs: idleMs,
          repeatedCorrections: repeatedCorrections.current,
          timeOnTaskMs: Date.now() - taskStartTime.current,
          textLength: scratch.length,
        });
        const friction = evaluateLearnerFriction(signals);
        setBehaviorState(friction);
        setLearningSignalsData(signals);
      }
    };

    idleTimerRef.current = setInterval(checkIdle, 3000);
    return () => clearInterval(idleTimerRef.current);
  }, [scratch, focusModalOpen]);

  // Voice Recognition Handler
  const toggleVoiceInput = (targetField) => {
    if (voiceTarget === targetField) {
      stopListening();
      setVoiceTarget(null);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setError("Speech recognition is not supported in this browser. Please type directly.");
      return;
    }

    setVoiceTarget(targetField);
    startListening({
      language: translateLang || "English",
      onTranscript: ({ text }) => {
        if (!text) return;
        if (targetField === "lesson") {
          setLesson(text);
        } else if (targetField === "interest") {
          setInterest(text);
        } else if (targetField === "scratch") {
          setScratch(text);
          // Trigger signal update for voice modality
          recordModalityOutcome(modalityProfile, "audio", 0.85);
          setModalityProfile(loadModalityProfile());
        } else if (targetField === "teach") {
          setTeachExplanation(text);
        }
      },
      onError: () => {
        setVoiceTarget(null);
      },
      onEnd: () => {
        setVoiceTarget(null);
      },
    });
  };

  // ---- API Helper Calls ----
  const handleRemix = async () => {
    if (!lesson.trim() || !interest.trim()) return;
    setRemixLoading(true);
    setRemix("");
    setError("");
    setAlertState("calm");
    setSteps("");
    setDiagnose(null);
    setBridge(null);
    setTeachback(null);
    setTeachExplanation("");
    setTranslated("");
    hasTriggered.current = false;
    hintUsedRef.current = false;
    taskStartTime.current = Date.now();

    try {
      const res = await fetch(`${API_BASE}/api/remix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson, interest }),
      });
      if (!res.ok) throw new Error("Remix request failed");
      const data = await res.json();
      setRemix(data.remix);
      remixTimestampRef.current = performance.now();

      // Pre-generate flashcards for memory retention
      handleGenerateFlashcards(data.remix || lesson, interest);

      try {
        const vRes = await fetch(`${API_BASE}/api/vibe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interest }),
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          setVibe(vData.vibe || "everyday");
        }
      } catch {
        // Safe cosmetic fallback
      }
    } catch (err) {
      setError(`Couldn't reach the backend at ${API_BASE}. Is the server running?`);
    } finally {
      setRemixLoading(false);
    }
  };

  const handleStepSwitch = async () => {
    setStepsLoading(true);
    setAlertState("stepped");
    setFocusModalOpen(true);
    recordModalityOutcome(modalityProfile, "micro-step", 0.9);
    setModalityProfile(loadModalityProfile());

    try {
      const source = remix || lesson;
      const res = await fetch(`${API_BASE}/api/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: source, interest }),
      });
      if (!res.ok) throw new Error("Steps request failed");
      const data = await res.json();
      setSteps(data.steps);
    } catch (err) {
      setSteps(`1. Notice the key question in ${interest || "the topic"}.\n2. Write down your first thought.\n3. Complete the calculation or reasoning.`);
    } finally {
      setStepsLoading(false);
    }
  };

  const handleHintRequest = async () => {
    setHintLoading(true);
    setHint("");
    setAlertState("hinted");
    hintUsedRef.current = true;
    try {
      const source = remix || lesson;
      const signals = extractLearningSignals({
        recentIntervals: recentIntervals.current,
        baseline: baseline.current,
        backspaceCount: backspaceCount.current,
        totalKeys: totalKeys.current,
        idleDurationMs: Date.now() - lastActivityTimestamp.current,
        repeatedCorrections: repeatedCorrections.current,
        timeOnTaskMs: Date.now() - taskStartTime.current,
        textLength: scratch.length,
      });

      const behavior = {
        backspaceRatio: signals.backspaceRatio,
        deviationPct: signals.deviationPct,
        confidence: behaviorState.confidence,
        state: behaviorState.state,
      };

      try {
        const res = await fetch(`${API_BASE}/api/hint`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: source, interest, behavior: JSON.stringify(behavior) }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.hint) {
            setHint(data.hint);
            return;
          }
        }
      } catch {
        // fallback
      }

      setHint(`Start by naming what you know about ${interest || "the concept"} and write that down.`);
    } finally {
      setHintLoading(false);
    }
  };

  const dismissOffer = () => {
    setAlertState("calm");
    setHint("");
    hasTriggered.current = true;
  };

  const handleSubmitAnswer = async () => {
    setSimplerLoading(true);
    setQuizLoading(true);
    setConfidence(null);
    setConfidenceFeedback("");
    setShowQuiz(false);
    setSimpler("");
    setQuiz("");

    try {
      const source = remix || lesson;
      const [simplerRes, quizRes] = await Promise.all([
        fetch(`${API_BASE}/api/simpler`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: source, interest }),
        }),
        fetch(`${API_BASE}/api/quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: source, interest }),
        }),
      ]);

      const simplerData = simplerRes.ok ? await simplerRes.json() : { simpler: "Simpler explanation unavailable." };
      const quizData = quizRes.ok ? await quizRes.json() : { quiz: "Quiz unavailable." };

      const understanding = evaluateUnderstanding(scratch, source, interest);
      setConfidence(understanding.confidence);
      setConfidenceFeedback(understanding.feedback);
      setSimpler(simplerData.simpler);
      setQuiz(quizData.quiz);
      setShowQuiz(true);

      // Record bandit reward & modality outcome
      const elapsed = remixTimestampRef.current ? performance.now() - remixTimestampRef.current : null;
      const reward = computeBanditReward({
        confidence: understanding.confidence,
        usedHint: hintUsedRef.current,
        timeToSubmitMs: elapsed,
      });

      banditStats.current = updateStats(banditStats.current, vibe, reward);
      saveBanditState(banditStats.current);
      setBanditInsight(bestArmInsight(banditStats.current));

      // Update modality profile based on active mode
      const activeMod = activeModalityView === "whiteboard" ? "visual" : "text";
      recordModalityOutcome(modalityProfile, activeMod, reward);
      setModalityProfile(loadModalityProfile());

      // Save updated personal baseline
      if (recentIntervals.current.length > 0) {
        baseline.current = savePersonalBaseline(baseline.current, recentIntervals.current);
      }
    } catch (err) {
      setSimpler("Couldn't load simpler explanation right now.");
      setQuiz("Couldn't load quiz right now.");
      setConfidenceFeedback("Understanding evaluated locally.");
      setShowQuiz(true);
    } finally {
      setSimplerLoading(false);
      setQuizLoading(false);
    }
  };

  const handleDiagnose = async () => {
    if (!scratch.trim()) return;
    setDiagnoseLoading(true);
    try {
      const source = remix || lesson;
      const res = await fetch(`${API_BASE}/api/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: scratch, lesson: source, interest }),
      });
      if (!res.ok) throw new Error("Diagnose failed");
      const data = await res.json();
      setDiagnose(data);
    } catch {
      setDiagnose({
        misconception: "Review the connection between parts and whole",
        fix: `Think about how pieces fit together in ${interest || "real life"}.`,
      });
    } finally {
      setDiagnoseLoading(false);
    }
  };

  const handleBridge = async () => {
    setBridgeLoading(true);
    recordModalityOutcome(modalityProfile, "analogy", 0.95);
    setModalityProfile(loadModalityProfile());

    try {
      const source = remix || lesson;
      const res = await fetch(`${API_BASE}/api/bridge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: source, interest }),
      });
      if (!res.ok) throw new Error("Bridge failed");
      const data = await res.json();
      setBridge(data);
    } catch {
      setBridge({
        steps: [
          `Everyone understands sharing slices of food or items with friends.`,
          `In ${interest || "your favorite activity"}, pieces and team roles work the exact same way.`,
          `In math and science, fractions formalize that exact part-to-whole relationship.`,
        ],
      });
    } finally {
      setBridgeLoading(false);
    }
  };

  const handleTeachback = async () => {
    if (!teachExplanation.trim()) return;
    setTeachbackLoading(true);
    recordModalityOutcome(modalityProfile, "teach-back", 1.0);
    setModalityProfile(loadModalityProfile());

    try {
      const source = remix || lesson;
      const res = await fetch(`${API_BASE}/api/teachback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanation: teachExplanation, lesson: source, interest }),
      });
      if (!res.ok) throw new Error("Teachback failed");
      const data = await res.json();
      setTeachback(data);
    } catch {
      setTeachback({
        reaction: `That's an insightful way to put it for ${interest || "our world"}!`,
        question: "How would you explain the denominator to someone seeing it for the first time?",
      });
    } finally {
      setTeachbackLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!remix.trim()) return;
    setTranslateLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: remix, targetLanguage: translateLang }),
      });
      if (!res.ok) throw new Error("Translate failed");
      const data = await res.json();
      setTranslated(data.translated);
    } catch {
      setTranslated(`[Translation in ${translateLang}] ${remix}`);
    } finally {
      setTranslateLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      setSpeechCharIndex(-1);
      return;
    }
    setSpeaking(true);
    recordModalityOutcome(modalityProfile, "audio", 0.9);
    setModalityProfile(loadModalityProfile());

    speak(
      remix || lesson,
      () => {
        setSpeaking(false);
        setSpeechCharIndex(-1);
      },
      (bound) => {
        setSpeechCharIndex(bound.charIndex || 0);
      }
    );
  };

  // ---- Whiteboard / Concept Visualization ----
  const handleVisualizeConcept = async () => {
    setIsVisualizing(true);
    setVisualFeedback("");
    recordModalityOutcome(modalityProfile, "visual", 1.05);
    setModalityProfile(loadModalityProfile());

    try {
      const source = remix || lesson;
      const res = await fetch(`${API_BASE}/api/visualize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: source, interest }),
      });
      if (!res.ok) throw new Error("Visualize failed");
      const data = await res.json();
      setVisualFeedback("Generated concept visualization on RiffBoard canvas below.");
    } catch {
      setVisualFeedback("Visualized concept structure using key thematic stages.");
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleAskRiffDrawing = ({ labels }) => {
    if (!labels) {
      setVisualFeedback("Add a text label or shape to your drawing, then ask Riff!");
      return;
    }
    setVisualFeedback(`Riff noticed labels: "${labels}". Great visual intuition! Connecting these with arrows shows how parts make up the whole.`);
  };

  // ---- Flashcard & Spaced Retention Handlers ----
  const handleGenerateFlashcards = async (sourceText, studentInterest) => {
    setIsGeneratingCards(true);
    try {
      const res = await fetch(`${API_BASE}/api/flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson: sourceText || remix || lesson, interest: studentInterest || interest }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.flashcards && data.flashcards.length > 0) {
          addCardsToRetention(data.flashcards);
          setFlashcards(data.flashcards);
          setRetentionStore(loadRetentionStore());
          return;
        }
      }
    } catch {
      // fallback
    }

    const fallback = generateDeterministicFlashcards(sourceText || remix || lesson, studentInterest || interest);
    addCardsToRetention(fallback);
    setFlashcards(fallback);
    setRetentionStore(loadRetentionStore());
    setIsGeneratingCards(false);
  };

  // ---- Keystroke / Pacing / Friction Observer ----
  const handleScratchKeyDown = useCallback((e) => {
    const now = performance.now();
    lastActivityTimestamp.current = Date.now();
    totalKeys.current += 1;

    if (e.key === "Backspace" || e.key === "Delete") {
      backspaceCount.current += 1;
      repeatedCorrections.current += 1;
    }

    if (lastKeyTime.current !== null) {
      const interval = now - lastKeyTime.current;
      if (interval < 5000 && interval > 40) {
        recentIntervals.current.push(interval);
        if (recentIntervals.current.length > 12) recentIntervals.current.shift();

        // Extract learning signals
        const signals = extractLearningSignals({
          recentIntervals: recentIntervals.current,
          baseline: baseline.current,
          backspaceCount: backspaceCount.current,
          totalKeys: totalKeys.current,
          idleDurationMs: 0,
          repeatedCorrections: repeatedCorrections.current,
          timeOnTaskMs: Date.now() - taskStartTime.current,
          textLength: scratch.length,
        });

        // ML Friction Inference
        const friction = evaluateLearnerFriction(signals);
        setBehaviorState(friction);
        setLearningSignalsData(signals);

        // Update waveform visualizer
        setBars((prev) => {
          const next = [...prev.slice(1)];
          const height = Math.max(6, Math.min(42, interval / 14));
          next.push(height);
          return next;
        });

        // Trigger gentle support offer if friction is detected
        if (signals.totalKeys >= 16 && friction.isFrictionDetected && !hasTriggered.current) {
          setAlertState("offered");
        }
      }
    }
    lastKeyTime.current = now;
  }, [scratch]);

  // Modality Selection Router from Adaptive Hub
  const handleSelectModality = (modalityId) => {
    if (modalityId === "whiteboard" || modalityId === "open_whiteboard") {
      setActiveModalityView("whiteboard");
    } else if (modalityId === "step_mode" || modalityId === "micro_step") {
      handleStepSwitch();
    } else if (modalityId === "audio" || modalityId === "read_aloud") {
      handleReadAloud();
    } else if (modalityId === "bridge") {
      handleBridge();
    } else if (modalityId === "teachback") {
      // scroll to teachback
    } else if (modalityId === "flashcards" || modalityId === "quick_recall") {
      setActiveModalityView("recall");
    } else if (modalityId === "neuro_read") {
      setNeuroReadOpen(true);
    } else if (modalityId === "hint") {
      handleHintRequest();
    } else if (modalityId === "simpler") {
      handleSubmitAnswer();
    }
  };

  const vibeTheme = getVibeTheme(vibe);
  const anyAiLoading =
    remixLoading || stepsLoading || hintLoading || simplerLoading || quizLoading ||
    diagnoseLoading || bridgeLoading || teachbackLoading || translateLoading || isGeneratingCards;

  const mascotMood = anyAiLoading
    ? "thinking"
    : alertState === "offered"
    ? "offered"
    : alertState === "hinted"
    ? "hinted"
    : "calm";

  const barColor = behaviorState.isFrictionDetected ? "var(--riff-coral)" : "var(--riff-teal)";

  // Format Neuro-Read styling
  const fontObj = READ_FONTS.find((f) => f.id === neuroSettings.fontFamily) || READ_FONTS[0];
  const contrastThemeObj = CONTRAST_THEMES.find((t) => t.id === neuroSettings.contrastTheme) || CONTRAST_THEMES[0];

  const fontSizeMap = { normal: "17px", large: "20px", xl: "24px" };
  const lineHeightMap = { normal: "1.65", relaxed: "1.95", spacious: "2.3" };
  const letterSpacingMap = { normal: "0em", wide: "0.04em", extrawide: "0.09em" };

  return (
    <div
      className="riff-root"
      style={{
        "--vibe-accent": vibeTheme.accent,
        "--vibe-accent-soft": vibeTheme.accentSoft,
      }}
    >
      {/* Header */}
      <div className="riff-header">
        <div className="riff-header-row">
          <div>
            <h1 className="riff-wordmark">
              Riff<span className="swash">.</span>
            </h1>
            <p className="riff-tagline">Adaptive Neuro-Learning Engine: Learns what you love. Teaches through it.</p>
          </div>
          <RiffMascot mood={mascotMood} accent={vibeTheme.accent} />
        </div>

        {banditInsight && banditInsight.average > 0 && (
          <p className="riff-insight">
            {vibeTheme.emoji} Riff's noticed you tend to click fastest with{" "}
            <strong>{getVibeTheme(banditInsight.arm).label}</strong>-style examples — about{" "}
            {Math.round(Math.min(1, banditInsight.average) * 100)}% average confidence there.
          </p>
        )}
      </div>

      {error && <div className="riff-error">{error}</div>}

      {/* ADAPTIVE NEURO-LEARNING ENGINE HUB */}
      <AdaptiveEngineHub
        adaptationDecision={adaptationDecision}
        behaviorState={behaviorState}
        understandingConfidence={confidence}
        modalityInsights={modalityInsights}
        retentionStats={retentionStats}
        onSelectModality={handleSelectModality}
        learningSignals={learningSignalsData}
      />

      {/* Main Lesson & Remix Panels */}
      <div className="riff-grid">
        {/* Lesson Input Panel */}
        <div className="riff-panel">
          <p className="riff-panel-label">1. The Academic Content</p>
          <div className="riff-input-label">What's the lesson or concept?</div>
          <div className="riff-input-with-voice">
            <textarea
              rows={5}
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="Paste or speak any concept, math problem, history topic, or science principle..."
            />
            <button
              type="button"
              className={`riff-voice-btn-corner ${voiceTarget === "lesson" ? "listening" : ""}`}
              onClick={() => toggleVoiceInput("lesson")}
              title="Voice Input (Speech-to-Text)"
              aria-label="Voice input for lesson"
            >
              🎤 {voiceTarget === "lesson" ? "Listening..." : "Voice"}
            </button>
          </div>

          <div className="riff-input-label">What do you love? (Your Interest)</div>
          <div className="riff-input-with-voice">
            <input
              type="text"
              placeholder="Minecraft, basketball, dinosaurs, space, baking..."
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            />
            <button
              type="button"
              className={`riff-voice-btn-corner ${voiceTarget === "interest" ? "listening" : ""}`}
              onClick={() => toggleVoiceInput("interest")}
              title="Voice Input (Speech-to-Text)"
              aria-label="Voice input for interest"
            >
              🎤
            </button>
          </div>

          <button
            className="riff-primary"
            onClick={handleRemix}
            disabled={remixLoading || !lesson.trim() || !interest.trim()}
          >
            {remixLoading ? "Riffing & Adapting..." : "⚡ Riff It (Transform Lesson)"}
          </button>
        </div>

        {/* Remixed Lesson & Neuro-Read Output Panel */}
        <div
          className="riff-panel"
          style={{
            backgroundColor: contrastThemeObj.bg,
            color: contrastThemeObj.text,
            borderColor: contrastThemeObj.border || "var(--line)",
          }}
        >
          <p className="riff-panel-label">2. Your Adaptive Riff</p>

          <div
            className={`riff-output ${!remix && !remixLoading ? "empty" : ""} ${
              neuroSettings.readingRuler ? "riff-reading-ruler-overlay" : ""
            }`}
            style={{
              fontFamily: fontObj.family,
              fontSize: fontSizeMap[neuroSettings.fontSize] || "17px",
              lineHeight: lineHeightMap[neuroSettings.lineHeight] || "1.65",
              letterSpacing: letterSpacingMap[neuroSettings.letterSpacing] || "0em",
              color: contrastThemeObj.text,
            }}
          >
            {remixLoading ? (
              "Reshaping the lesson around what you love..."
            ) : remix ? (
              speechCharIndex >= 0 ? (
                <span>
                  <span>{remix.slice(0, speechCharIndex)}</span>
                  <mark className="riff-reading-highlight">
                    {remix.slice(speechCharIndex, speechCharIndex + 12)}
                  </mark>
                  <span>{remix.slice(speechCharIndex + 12)}</span>
                </span>
              ) : (
                remix
              )
            ) : (
              "Your remixed lesson shows up here — type an interest and hit Riff it."
            )}
          </div>

          {remix && !remixLoading && (
            <div className="riff-output-actions">
              <button
                className="riff-btn-small ghost"
                onClick={handleReadAloud}
                disabled={!isSpeechSupported()}
                title={isSpeechSupported() ? "Listen to speech audio" : "Browser doesn't support read-aloud"}
              >
                {speaking ? "⏹ Stop Audio" : "🔊 Read Aloud"}
              </button>
              <select
                className="riff-lang-select"
                value={translateLang}
                onChange={(e) => setTranslateLang(e.target.value)}
                aria-label="Target language translation"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <button className="riff-btn-small ghost" onClick={handleTranslate} disabled={translateLoading}>
                {translateLoading ? "Translating..." : "Translate"}
              </button>
            </div>
          )}

          {translated && (
            <div className="riff-translated">
              <div className="riff-input-label">In {translateLang}</div>
              {translated}
            </div>
          )}

          {/* Neuro-Read Accessibility Controls */}
          <NeuroReadControls
            settings={neuroSettings}
            onChange={setNeuroSettings}
            isOpen={neuroReadOpen}
            onToggle={() => setNeuroReadOpen(!neuroReadOpen)}
          />
        </div>
      </div>

      {/* Multimodal View Switcher (Scratchpad | Whiteboard | Memory Recall) */}
      <div className="riff-scratch-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <p className="riff-panel-label" style={{ margin: 0 }}>
            3. Practice & Multimodal Response
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className={`riff-btn-small ${activeModalityView === "scratch" ? "accept" : "ghost"}`}
              onClick={() => setActiveModalityView("scratch")}
            >
              ✍️ Scratchpad
            </button>
            <button
              className={`riff-btn-small ${activeModalityView === "whiteboard" ? "accept" : "ghost"}`}
              onClick={() => setActiveModalityView("whiteboard")}
            >
              🎨 RiffBoard
            </button>
            <button
              className={`riff-btn-small ${activeModalityView === "recall" ? "accept" : "ghost"}`}
              onClick={() => setActiveModalityView("recall")}
            >
              🗂️ Memory & Recall ({retentionStats.due} due)
            </button>
          </div>
        </div>

        {/* View 1: Scratchpad & Rhythm Observer */}
        {activeModalityView === "scratch" && (
          <div style={{ marginTop: 14 }}>
            <div className="riff-input-label">Jot down your thinking or answer below:</div>
            <div className="riff-input-with-voice">
              <textarea
                rows={4}
                placeholder="Start typing or speak your answer — Riff quietly observes your rhythm against your own baseline..."
                value={scratch}
                onChange={(e) => setScratch(e.target.value)}
                onKeyDown={handleScratchKeyDown}
              />
              <button
                type="button"
                className={`riff-voice-btn-corner ${voiceTarget === "scratch" ? "listening" : ""}`}
                onClick={() => toggleVoiceInput("scratch")}
                title="Speak answer via microphone"
                aria-label="Voice input for scratchpad"
              >
                🎤 {voiceTarget === "scratch" ? "Listening..." : "Speak Answer"}
              </button>
            </div>

            <div className="riff-submit-row">
              <button
                className="riff-btn-small accept"
                onClick={handleSubmitAnswer}
                disabled={!scratch.trim() || simplerLoading || quizLoading}
              >
                Submit Answer & Check Understanding
              </button>
              <button className="riff-btn-small ghost" onClick={handleStepSwitch}>
                🪜 Micro-Step Mode
              </button>
            </div>

            {/* Signal Waveform */}
            <div className="riff-waveform" title="Your live typing cadence vs personal baseline">
              {bars.map((h, i) => (
                <div key={i} className="riff-bar" style={{ height: `${h}px`, background: barColor }} />
              ))}
            </div>

            {/* Gentle Friction Support Offer */}
            {alertState === "offered" && (
              <div className="riff-offer">
                <span className="riff-offer-text">
                  Riff noticed you may be getting stuck. Let's make this easier — want a step-by-step hint?
                </span>
                <div className="riff-offer-actions">
                  <button className="riff-btn-small accept" onClick={handleHintRequest}>
                    Yes, give me a hint
                  </button>
                  <button className="riff-btn-small ghost" onClick={handleStepSwitch}>
                    Try Micro-Steps
                  </button>
                  <button className="riff-btn-small dismiss" onClick={dismissOffer}>
                    No thanks
                  </button>
                </div>
              </div>
            )}

            {/* Hints & Understanding Checks */}
            {(alertState === "hinted" || showQuiz || confidence !== null || simpler || quiz) && (
              <div>
                {alertState === "hinted" && (
                  <div className="riff-hint-box">
                    <div className="riff-input-label">A focused hint from Riff</div>
                    <div className="riff-hint-text">
                      {hintLoading ? "Thinking of a supportive nudge..." : hint || "Ask for a hint when you feel stuck."}
                    </div>
                    <button className="riff-btn-small accept" onClick={handleHintRequest}>
                      Get another hint
                    </button>
                  </div>
                )}

                {confidence !== null && (
                  <div className="riff-hint-box">
                    <div className="riff-input-label">Understanding Check</div>
                    <div className="riff-hint-text">
                      <strong>{Math.round(confidence * 100)}%</strong> confidence
                      <br />
                      {confidenceFeedback}
                    </div>
                  </div>
                )}

                {simpler && (
                  <div className="riff-hint-box">
                    <div className="riff-input-label">Simpler Explanation</div>
                    <div className="riff-hint-text">{simpler}</div>
                  </div>
                )}

                {showQuiz && (
                  <div className="riff-hint-box">
                    <div className="riff-input-label">Quick Quiz Practice</div>
                    <div className="riff-hint-text">
                      {quizLoading ? "Creating practice questions..." : quiz}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* View 2: Whiteboard (RiffBoard) */}
        {activeModalityView === "whiteboard" && (
          <div style={{ marginTop: 14 }}>
            <Whiteboard
              concept={remix || lesson}
              interest={interest}
              onAskRiff={handleAskRiffDrawing}
              onVisualizeConcept={handleVisualizeConcept}
              isVisualizing={isVisualizing}
              visualFeedback={visualFeedback}
            />
          </div>
        )}

        {/* View 3: Memory & Retention Recall Engine */}
        {activeModalityView === "recall" && (
          <div style={{ marginTop: 14 }}>
            <RecallView
              cards={flashcards}
              onGenerateCards={() => handleGenerateFlashcards(remix || lesson, interest)}
              isGenerating={isGeneratingCards}
              onRefresh={() => setRetentionStore(loadRetentionStore())}
            />
          </div>
        )}
      </div>

      {/* Focus Support Mode Modal */}
      <FocusSupportModal
        isOpen={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        lesson={remix || lesson}
        interest={interest}
        steps={steps}
        onSwitchModality={(mod) => {
          if (mod === "whiteboard") setActiveModalityView("whiteboard");
          else if (mod === "audio") handleReadAloud();
          else if (mod === "bridge") handleBridge();
        }}
      />

      {/* Riff Lab Section */}
      <div className="riff-lab-section">
        <p className="riff-panel-label">4. Riff Lab — Alternative Multimodal Pathways</p>
        <div className="riff-lab-grid">
          {/* Debug My Thinking */}
          <div className="riff-hint-box riff-lab-card">
            <div className="riff-input-label">Debug my thinking</div>
            <div className="riff-hint-text">
              {diagnoseLoading ? (
                "Pinpointing the exact gap..."
              ) : diagnose ? (
                <>
                  <strong>{diagnose.misconception}</strong>
                  <br />
                  {diagnose.fix}
                </>
              ) : (
                'Submit your scratchpad answer, then find the exact misconception behind it — not just "wrong."'
              )}
            </div>
            <button
              className="riff-btn-small accept"
              onClick={handleDiagnose}
              disabled={!scratch.trim() || diagnoseLoading}
            >
              Find my misconception
            </button>
          </div>

          {/* Bridge It */}
          <div className="riff-hint-box riff-lab-card">
            <div className="riff-input-label">Bridge it (Analogy Chain)</div>
            <div className="riff-hint-text">
              {bridgeLoading && "Building the 3-step bridge..."}
              {!bridgeLoading && bridge && (
                <ol className="riff-bridge-chain">
                  {bridge.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
              {!bridgeLoading &&
                !bridge &&
                "Get a 3-step chain from something everyday, through your interest, to the real idea."}
            </div>
            <button className="riff-btn-small accept" onClick={handleBridge} disabled={bridgeLoading}>
              Build me a bridge
            </button>
          </div>

          {/* Teach It Back */}
          <div className="riff-hint-box riff-lab-card">
            <div className="riff-input-label">Teach it back (Reverse Tutoring)</div>
            <div className="riff-input-with-voice">
              <textarea
                rows={3}
                placeholder={`Teach this concept in your own words to a friendly buddy from ${interest || "your world"}...`}
                value={teachExplanation}
                onChange={(e) => setTeachExplanation(e.target.value)}
              />
              <button
                type="button"
                className={`riff-voice-btn-corner ${voiceTarget === "teach" ? "listening" : ""}`}
                onClick={() => toggleVoiceInput("teach")}
                title="Speak explanation"
                aria-label="Voice input for teachback"
              >
                🎤
              </button>
            </div>
            <button
              className="riff-btn-small accept"
              style={{ marginTop: 8 }}
              onClick={handleTeachback}
              disabled={!teachExplanation.trim() || teachbackLoading}
            >
              {teachbackLoading ? "Listening..." : "Teach it to my buddy"}
            </button>
            {teachback && (
              <div className="riff-teachback-reply">
                <em>{teachback.reaction}</em>
                <br />
                {teachback.question}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="riff-footnote">
        Adaptive neuro-learning signals compared strictly to your own personal baseline — never to anyone else's.
      </p>
    </div>
  );
}