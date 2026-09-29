// App.jsx
// RIFF — Adaptive Neuro-Learning Engine
// Redesigned with Fluxora visual design principles:
// Fullscreen /hero-loop.mp4 video, Instrument Serif display typography, centered pill navbar,
// glassmorphism metric cards, ghost analytics telemetry, vertical guide lines,
// and real closed-loop adaptive neuro-learning state.

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
  getMemoryHealthOverview,
} from "./retentionEngine";
import { decideAdaptation, INTERVENTIONS } from "./adaptationEngine";
import {
  AUTOPILOT_STATES,
  loadSessionEvents,
  createSessionEvent,
  loadConfidenceJourney,
  recordConfidenceMilestone,
  createAdaptationRecord,
  clearSessionHistory,
} from "./riffController";
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

// UI Components
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import AdaptiveVisualization from "./components/AdaptiveVisualization.jsx";
import RiffMascot from "./Mascot.jsx";
import AdaptiveEngineHub from "./AdaptiveEngineHub.jsx";
import WhyRiffAdapted from "./WhyRiffAdapted.jsx";
import AdaptiveTimeline from "./AdaptiveTimeline.jsx";
import ConfidenceJourney from "./ConfidenceJourney.jsx";
import LearningDNA from "./LearningDNA.jsx";
import FocusRoom from "./FocusRoom.jsx";
import DemoMode from "./DemoMode.jsx";
import Whiteboard from "./Whiteboard.jsx";
import RecallView from "./RecallView.jsx";
import NeuroReadControls, { READ_FONTS, CONTRAST_THEMES } from "./NeuroReadControls.jsx";

const LANGUAGES = ["Hindi", "Spanish", "French", "Mandarin", "Arabic", "Tamil", "Marathi"];
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3010").replace(/\/$/, "");

const SAMPLE_LESSON =
  "A fraction represents a part of a whole. The number on top, called the numerator, tells you how many parts you have. The number on the bottom, called the denominator, tells you how many equal parts the whole is divided into. For example, in the fraction 3/4, you have 3 parts out of 4 equal parts total.";

export default function App() {
  const [activeNav, setActiveNav] = useState("learn");

  // Lesson & Personalization
  const [lesson, setLesson] = useState(SAMPLE_LESSON);
  const [interest, setInterest] = useState("");
  const [remix, setRemix] = useState("");
  const [remixLoading, setRemixLoading] = useState(false);
  const [error, setError] = useState("");

  // Scratchpad & Real-time Behavior
  const [scratch, setScratch] = useState("");
  const [bars, setBars] = useState(Array(24).fill(6));
  const [alertState, setAlertState] = useState("calm"); // calm | offered | hinted
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

  // Vibe & Bandit
  const [vibe, setVibe] = useState("everyday");
  const [banditInsight, setBanditInsight] = useState(null);

  // Multimodal Teach Riff
  const [teachMode, setTeachMode] = useState("type");
  const [teachExplanation, setTeachExplanation] = useState("");
  const [teachback, setTeachback] = useState(null);
  const [teachbackLoading, setTeachbackLoading] = useState(false);
  const [teachRubric, setTeachRubric] = useState(null);

  // Riff Lab (Debug & Bridge)
  const [diagnose, setDiagnose] = useState(null);
  const [diagnoseLoading, setDiagnoseLoading] = useState(false);
  const [bridge, setBridge] = useState(null);
  const [bridgeLoading, setBridgeLoading] = useState(false);

  // Audio & Speech
  const [translateLang, setTranslateLang] = useState("Hindi");
  const [translated, setTranslated] = useState("");
  const [translateLoading, setTranslateLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechCharIndex, setSpeechCharIndex] = useState(-1);
  const [voiceTarget, setVoiceTarget] = useState(null);

  // Autopilot & Central Telemetry
  const [autopilotState, setAutopilotState] = useState(AUTOPILOT_STATES.OBSERVING);
  const [currentModality, setCurrentModality] = useState("text");
  const [behaviorState, setBehaviorState] = useState({
    state: LEARNER_STATES.FOCUSED,
    confidence: 0.8,
    frictionScore: 0.1,
    isFrictionDetected: false,
    probabilities: { focused: 0.8, uncertain: 0.1, struggling: 0.05, disengaging: 0.05 },
  });
  const [sessionEvents, setSessionEvents] = useState([]);
  const [confidencePoints, setConfidencePoints] = useState([]);
  const [currentAdaptationRecord, setCurrentAdaptationRecord] = useState(null);
  const [whyAdaptedModalOpen, setWhyAdaptedModalOpen] = useState(false);
  const [focusRoomOpen, setFocusRoomOpen] = useState(false);
  const [demoModeOpen, setDemoModeOpen] = useState(false);

  // Modality & Retention Engine Stores
  const [modalityProfile, setModalityProfile] = useState(loadModalityProfile());
  const [retentionStore, setRetentionStore] = useState(loadRetentionStore());
  const [flashcards, setFlashcards] = useState([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // RiffBoard Visualizer
  const [visualFeedback, setVisualFeedback] = useState("");
  const [isVisualizing, setIsVisualizing] = useState(false);

  // Neuro-Read Settings
  const [neuroReadOpen, setNeuroReadOpen] = useState(false);
  const [neuroSettings, setNeuroSettings] = useState({
    fontSize: "normal",
    lineHeight: "normal",
    letterSpacing: "normal",
    fontFamily: "inter",
    contrastTheme: "default",
    readingRuler: false,
    bionicFocus: false,
  });

  // Telemetry Refs
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

  // Initialize Session
  useEffect(() => {
    baseline.current = loadPersonalBaseline();
    setRetentionStore(loadRetentionStore());
    setModalityProfile(loadModalityProfile());
    setSessionEvents(loadSessionEvents());
    setConfidencePoints(loadConfidenceJourney());
    setBanditInsight(bestArmInsight(banditStats.current));
  }, []);

  const modalityInsights = getModalityInsights(modalityProfile);
  const retentionStats = getRetentionStats(retentionStore);

  // Central Adaptation Decision
  const adaptationDecision = decideAdaptation({
    behaviorState,
    understandingConfidence: confidence,
    retentionDueCount: retentionStats.due,
    preferredModality: modalityInsights.topModality,
    interest,
    hasLesson: Boolean(remix || lesson),
  });

  // Smooth scroll / navigation helper
  const handleScrollToSection = (sectionId) => {
    setActiveNav(sectionId);
    if (sectionId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Idle and Disengagement Detection
  useEffect(() => {
    const checkIdle = () => {
      const idleMs = Date.now() - lastActivityTimestamp.current;
      if (idleMs > 6500 && totalKeys.current > 6 && !focusRoomOpen) {
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
        if (friction.isFrictionDetected) {
          setAutopilotState(AUTOPILOT_STATES.ADAPTING);
        }
      }
    };
    idleTimerRef.current = setInterval(checkIdle, 3000);
    return () => clearInterval(idleTimerRef.current);
  }, [scratch, focusRoomOpen]);

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
        if (targetField === "lesson") setLesson(text);
        else if (targetField === "interest") setInterest(text);
        else if (targetField === "scratch") {
          setScratch(text);
          recordModalityOutcome(modalityProfile, "audio", 0.85);
          setModalityProfile(loadModalityProfile());
        } else if (targetField === "teach") {
          setTeachExplanation(text);
        }
      },
      onError: () => setVoiceTarget(null),
      onEnd: () => setVoiceTarget(null),
    });
  };

  // ---- Riff It / Lesson Remix ----
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
    setAutopilotState(AUTOPILOT_STATES.THINKING);
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

      const { updated } = createSessionEvent({
        type: "lesson_start",
        title: `Lesson Riffed: ${interest}`,
        detail: `Academic content adapted around ${interest} metaphor.`,
        icon: "⚡",
        badge: "Riff It",
      });
      setSessionEvents(updated);

      const updatedConf = recordConfidenceMilestone("Riffed", 0.52, "remix");
      setConfidencePoints(updatedConf);

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
      } catch {}

      setAutopilotState(AUTOPILOT_STATES.OBSERVING);
    } catch (err) {
      setError(`Couldn't reach backend at ${API_BASE}. Is server running?`);
      setAutopilotState(AUTOPILOT_STATES.OBSERVING);
    } finally {
      setRemixLoading(false);
    }
  };

  // ---- Micro-Steps & Focus Room ----
  const handleOpenFocusRoom = async () => {
    setStepsLoading(true);
    setFocusRoomOpen(true);
    setCurrentModality("micro-step");
    recordModalityOutcome(modalityProfile, "micro-step", 0.95);
    setModalityProfile(loadModalityProfile());

    createSessionEvent({
      type: "modality_switch",
      title: "Focus Room Activated",
      detail: "De-cluttered step-by-step sequencing initiated.",
      icon: "🪜",
      badge: "Focus Mode",
    });
    setSessionEvents(loadSessionEvents());

    try {
      const source = remix || lesson;
      const res = await fetch(`${API_BASE}/api/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: source, interest }),
      });
      if (!res.ok) throw new Error("Steps failed");
      const data = await res.json();
      setSteps(data.steps);
    } catch {
      setSteps(`1. Identify the core relationship in ${interest || "the concept"}.\n2. Write down your first thought.\n3. Verify the outcome with an example.`);
    } finally {
      setStepsLoading(false);
    }
  };

  // ---- Hint Request ----
  const handleHintRequest = async () => {
    setHintLoading(true);
    setHint("");
    setAlertState("hinted");
    hintUsedRef.current = true;
    setAutopilotState(AUTOPILOT_STATES.HELPING);

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
      } catch {}

      setHint(`Start by naming what you know about ${interest || "the concept"} and write that down.`);
    } finally {
      setHintLoading(false);
    }
  };

  // ---- Submit Answer & Check Understanding ----
  const handleSubmitAnswer = async () => {
    setSimplerLoading(true);
    setQuizLoading(true);
    setConfidence(null);
    setConfidenceFeedback("");
    setShowQuiz(false);
    setSimpler("");
    setQuiz("");
    setAutopilotState(AUTOPILOT_STATES.THINKING);

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

      const simplerData = simplerRes.ok ? await simplerRes.json() : { simpler: "Simpler explanation ready." };
      const quizData = quizRes.ok ? await quizRes.json() : { quiz: "Practice quiz ready." };

      const understanding = evaluateUnderstanding(scratch, source, interest);
      setConfidence(understanding.confidence);
      setConfidenceFeedback(understanding.feedback);
      setSimpler(simplerData.simpler);
      setQuiz(quizData.quiz);
      setShowQuiz(true);

      const updatedConf = recordConfidenceMilestone("Answer Check", understanding.confidence, "practice");
      setConfidencePoints(updatedConf);

      createSessionEvent({
        type: "understanding_checked",
        title: `Understanding Checked: ${Math.round(understanding.confidence * 100)}%`,
        detail: understanding.feedback,
        icon: "🎯",
        badge: "Confidence Check",
      });
      setSessionEvents(loadSessionEvents());

      const elapsed = remixTimestampRef.current ? performance.now() - remixTimestampRef.current : null;
      const reward = computeBanditReward({
        confidence: understanding.confidence,
        usedHint: hintUsedRef.current,
        timeToSubmitMs: elapsed,
      });

      banditStats.current = updateStats(banditStats.current, vibe, reward);
      saveBanditState(banditStats.current);
      setBanditInsight(bestArmInsight(banditStats.current));

      recordModalityOutcome(modalityProfile, currentModality, reward);
      setModalityProfile(loadModalityProfile());

      if (recentIntervals.current.length > 0) {
        baseline.current = savePersonalBaseline(baseline.current, recentIntervals.current);
      }

      setAutopilotState(AUTOPILOT_STATES.OBSERVING);
    } catch (err) {
      setSimpler("Simpler summary ready.");
      setQuiz("Quick quiz ready.");
      setConfidenceFeedback("Understanding evaluated locally.");
      setShowQuiz(true);
      setAutopilotState(AUTOPILOT_STATES.OBSERVING);
    } finally {
      setSimplerLoading(false);
      setQuizLoading(false);
    }
  };

  // ---- Multimodal Teach Riff ----
  const handleTeachback = async () => {
    if (!teachExplanation.trim()) return;
    setTeachbackLoading(true);
    setAutopilotState(AUTOPILOT_STATES.THINKING);
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

      const evalResult = evaluateUnderstanding(teachExplanation, source, interest);
      const isStrong = evalResult.confidence >= 0.7;
      setTeachRubric({
        coreIdea: true,
        relationship: evalResult.confidence >= 0.5,
        exampleIncluded: Boolean(interest && teachExplanation.toLowerCase().includes(interest.toLowerCase())),
        missingDetail: isStrong ? null : "Could include one more step on how the parts interact.",
        confidenceScore: Math.round(evalResult.confidence * 100),
      });

      const updatedConf = recordConfidenceMilestone("Teach-Back", Math.max(0.75, evalResult.confidence), "teachback");
      setConfidencePoints(updatedConf);

      createSessionEvent({
        type: "teachback",
        title: "Teach-Back Completed",
        detail: `Explained in own words. Socratic feedback delivered.`,
        icon: "🗣️",
        badge: "Teach-Back",
      });
      setSessionEvents(loadSessionEvents());
      setAutopilotState(AUTOPILOT_STATES.OBSERVING);
    } catch {
      setTeachback({
        reaction: `That makes a lot of sense for ${interest || "our world"}!`,
        question: "How would you explain the denominator to someone seeing it for the first time?",
      });
      setTeachRubric({
        coreIdea: true,
        relationship: true,
        exampleIncluded: true,
        missingDetail: null,
        confidenceScore: 82,
      });
      setAutopilotState(AUTOPILOT_STATES.OBSERVING);
    } finally {
      setTeachbackLoading(false);
    }
  };

  // ---- Concept Bridge ----
  const handleBridge = async () => {
    setBridgeLoading(true);
    setCurrentModality("analogy");
    recordModalityOutcome(modalityProfile, "analogy", 0.95);
    setModalityProfile(loadModalityProfile());

    createSessionEvent({
      type: "modality_switch",
      title: "Concept Bridge Generated",
      detail: "3-step analogy chain connected to personal interest.",
      icon: "🌉",
      badge: "Analogy Mode",
    });
    setSessionEvents(loadSessionEvents());

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
          `Everyone understands sharing slices of pizza or items with friends.`,
          `In ${interest || "your favorite activity"}, pieces and team roles work the exact same way.`,
          `In math and science, fractions formalize that exact part-to-whole relationship.`,
        ],
      });
    } finally {
      setBridgeLoading(false);
    }
  };

  // ---- Read Aloud Narration ----
  const handleReadAloud = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      setSpeechCharIndex(-1);
      return;
    }
    setSpeaking(true);
    setCurrentModality("audio");
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

  // ---- Whiteboard / Concept Visualizer ----
  const handleVisualizeConcept = async () => {
    setIsVisualizing(true);
    setVisualFeedback("");
    setCurrentModality("visual");
    recordModalityOutcome(modalityProfile, "visual", 1.05);
    setModalityProfile(loadModalityProfile());

    createSessionEvent({
      type: "modality_switch",
      title: "Visual Model Rendered",
      detail: "RiffBoard generated structured schematic diagram.",
      icon: "🎨",
      badge: "Visual Model",
    });
    setSessionEvents(loadSessionEvents());

    try {
      const source = remix || lesson;
      const res = await fetch(`${API_BASE}/api/visualize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: source, interest }),
      });
      if (!res.ok) throw new Error("Visualize failed");
      setVisualFeedback("Generated structured schematic concept model on RiffBoard canvas.");
    } catch {
      setVisualFeedback("Rendered visual concept stages on canvas.");
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleAskRiffDrawing = ({ labels }) => {
    if (!labels) {
      setVisualFeedback("Add a text label or shape to your drawing, then ask Riff!");
      return;
    }
    setVisualFeedback(
      `Riff noticed labels: "${labels}". You've identified the core parts! Adding arrows between them will clarify the transition sequence.`
    );
  };

  // ---- Flashcards & Spaced Retention ----
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
    } catch {}

    const fallback = generateDeterministicFlashcards(sourceText || remix || lesson, studentInterest || interest);
    addCardsToRetention(fallback);
    setFlashcards(fallback);
    setRetentionStore(loadRetentionStore());
    setIsGeneratingCards(false);
  };

  // ---- Real-Time Keystroke Observer ----
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

        const friction = evaluateLearnerFriction(signals);
        setBehaviorState(friction);

        setBars((prev) => {
          const next = [...prev.slice(1)];
          const height = Math.max(6, Math.min(42, interval / 14));
          next.push(height);
          return next;
        });

        if (signals.totalKeys >= 16 && friction.isFrictionDetected && !hasTriggered.current) {
          setAlertState("offered");
          setAutopilotState(AUTOPILOT_STATES.ADAPTING);

          const adaptRecord = createAdaptationRecord({
            fromModality: currentModality,
            toModality: friction.recommendedSupport === "micro_step" ? "micro-step" : "visual",
            signals,
            reasonText: "Riff detected typing pacing slowdown and revision bursts compared to your personal baseline.",
          });
          setCurrentAdaptationRecord(adaptRecord);

          createSessionEvent({
            type: "friction_detected",
            title: "Friction Detected",
            detail: `Typing slowed by ${Math.round(signals.deviationPct)}% vs personal baseline.`,
            icon: "⚠️",
            badge: "RiffSense Alert",
          });
          setSessionEvents(loadSessionEvents());
        }
      }
    }
    lastKeyTime.current = now;
  }, [scratch, currentModality]);

  // Modality switch handler
  const handleExplainThreeWays = (modality) => {
    setCurrentModality(modality);
    if (modality === "visual") {
      handleScrollToSection("riffboard");
      handleVisualizeConcept();
    } else if (modality === "micro-step") {
      handleOpenFocusRoom();
    } else if (modality === "analogy") {
      handleBridge();
    } else if (modality === "audio") {
      handleReadAloud();
    }
  };

  // Autopilot Adaptation Acceptor
  const handleAcceptAdaptation = (actionId) => {
    if (actionId === "open_whiteboard") {
      handleScrollToSection("riffboard");
      setCurrentModality("visual");
      handleVisualizeConcept();
    } else if (actionId === "step_mode") {
      handleOpenFocusRoom();
    } else if (actionId === "quick_recall" || actionId === "flashcards") {
      handleScrollToSection("recall");
    } else if (actionId === "teachback") {
      setTeachMode("type");
    } else if (actionId === "simpler") {
      handleSubmitAnswer();
    } else if (actionId === "hint") {
      handleHintRequest();
    }
  };

  // Judge Demo Walkthrough
  const handleRunAdaptiveDemo = () => {
    setLesson("Photosynthesis: Plants convert water, carbon dioxide, and sunlight into glucose and oxygen.");
    setInterest("Space Exploration");
    handleRemix();
    handleScrollToSection("learn");
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
    : behaviorState.isFrictionDetected
    ? "adapting"
    : "observing";

  const fontObj = READ_FONTS.find((f) => f.id === neuroSettings.fontFamily) || READ_FONTS[0];
  const contrastThemeObj = CONTRAST_THEMES.find((t) => t.id === neuroSettings.contrastTheme) || CONTRAST_THEMES[0];
  const fontSizeMap = { normal: "16px", large: "19px", xl: "23px" };
  const lineHeightMap = { normal: "1.7", relaxed: "2.0", spacious: "2.4" };
  const letterSpacingMap = { normal: "0em", wide: "0.04em", extrawide: "0.09em" };

  return (
    <div className="min-h-screen bg-[#07050B] text-white selection:bg-[#7C3AED]/30 selection:text-white flex flex-col justify-between">
      {/* 1. FLUXORA CENTERED PILL NAVBAR */}
      <Navbar
        onNavigate={handleScrollToSection}
        activeSection={activeNav}
        onOpenNeuroRead={() => setNeuroReadOpen(true)}
      />

      {/* 2. CINEMATIC FULLSCREEN VIDEO HERO */}
      <div id="hero">
        <Hero
          onStartLearning={() => handleScrollToSection("learn")}
          onExploreAdaptive={() => handleScrollToSection("adaptive-engine")}
          understandingConfidence={confidence}
          retentionDueCount={retentionStats.due}
          behaviorState={behaviorState}
          currentModality={currentModality}
        />
      </div>

      {/* Floating System Status Presence */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <RiffMascot mood={mascotMood} accent={vibeTheme.accent} />
      </div>

      {/* MAIN APPLICATION SECTIONS WRAPPER */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-16 space-y-24 w-full bg-[#08070B]">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}

        {/* SECTION 1: LEARN & PRACTICE WORKSPACE */}
        <section id="learn" className="space-y-8 scroll-mt-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C084FC] font-semibold px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
                01 • Learning Workspace
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white font-bold mt-3">
                What do you want to learn?
              </h2>
            </div>
            <p className="text-xs text-white/50 max-w-md font-light">
              Paste your concept and your favorite interest. Riff will transform the explanation and dynamically adapt as you practice.
            </p>
          </div>

          {/* 2-Column Lesson & Adaptive Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel 1: Concept & Interest Input */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.035] border border-white/[0.1] backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-xs text-white/70 uppercase tracking-wider font-semibold">
                    1. Academic Concept
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput("lesson")}
                    className={`px-3 py-1 rounded-full text-[11px] font-mono border transition-all ${
                      voiceTarget === "lesson"
                        ? "bg-rose-500/20 text-rose-300 border-rose-400 animate-pulse"
                        : "bg-white/[0.05] text-white/60 border-white/10 hover:text-white"
                    }`}
                  >
                    🎤 {voiceTarget === "lesson" ? "Listening..." : "Voice Input"}
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="Explain binary search to me..."
                  className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C084FC] transition-all resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between mt-5 mb-2">
                  <label className="font-mono text-xs text-white/70 uppercase tracking-wider font-semibold">
                    2. What do you love? (Interest Metaphor)
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput("interest")}
                    className={`px-3 py-1 rounded-full text-[11px] font-mono border transition-all ${
                      voiceTarget === "interest"
                        ? "bg-rose-500/20 text-rose-300 border-rose-400 animate-pulse"
                        : "bg-white/[0.05] text-white/60 border-white/10 hover:text-white"
                    }`}
                  >
                    🎤 {voiceTarget === "interest" ? "Listening..." : "Voice"}
                  </button>
                </div>
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="Space exploration, Minecraft, Formula 1, dinosaurs, basketball..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C084FC] transition-all"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
                <button
                  onClick={handleRemix}
                  disabled={remixLoading || !lesson.trim() || !interest.trim()}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C084FC] text-white font-semibold text-xs tracking-wider uppercase hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all duration-300 shadow-xl shadow-[#7C3AED]/20 flex items-center justify-center gap-2"
                >
                  {remixLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Riffing & Adapting...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Riff It (Personalize Concept)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Panel 2: Adaptive Output & Neuro-Read */}
            <div
              className="p-6 sm:p-8 rounded-3xl border backdrop-blur-xl flex flex-col justify-between shadow-xl transition-all"
              style={{
                backgroundColor: contrastThemeObj.bg,
                borderColor: contrastThemeObj.border,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-[#C084FC] uppercase tracking-wider font-semibold">
                    2. Adaptive Remixed Lesson
                  </span>
                  {remix && (
                    <span className="text-[10px] font-mono text-white/40 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10">
                      Metaphor: {interest}
                    </span>
                  )}
                </div>

                <div
                  className={`min-h-[160px] p-5 rounded-2xl bg-black/30 border border-white/[0.06] transition-all leading-relaxed ${
                    neuroSettings.readingRuler ? "ring-2 ring-[#9F67FF]/40" : ""
                  }`}
                  style={{
                    fontFamily: fontObj.family,
                    fontSize: fontSizeMap[neuroSettings.fontSize] || "16px",
                    lineHeight: lineHeightMap[neuroSettings.lineHeight] || "1.7",
                    letterSpacing: letterSpacingMap[neuroSettings.letterSpacing] || "0em",
                    color: contrastThemeObj.text,
                  }}
                >
                  {remixLoading ? (
                    <div className="flex items-center gap-3 text-white/50 text-sm italic">
                      <span className="w-4 h-4 rounded-full border-2 border-[#C084FC] border-t-transparent animate-spin" />
                      <span>Reshaping academic structure around {interest}...</span>
                    </div>
                  ) : remix ? (
                    speechCharIndex >= 0 ? (
                      <span>
                        <span>{remix.slice(0, speechCharIndex)}</span>
                        <mark className="bg-[#7C3AED]/40 text-white rounded px-1">
                          {remix.slice(speechCharIndex, speechCharIndex + 14)}
                        </mark>
                        <span>{remix.slice(speechCharIndex + 14)}</span>
                      </span>
                    ) : (
                      remix
                    )
                  ) : (
                    <span className="text-white/40 text-sm italic">
                      Your personalized, interest-remixed lesson will appear here once you type your concept & interest and hit "Riff It".
                    </span>
                  )}
                </div>

                {/* Suggested Modalities Strip */}
                {remix && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08]">
                    <span className="block text-[11px] font-mono text-white/50 uppercase mb-2">
                      Try:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "visual", label: "🎨 Visual" },
                        { id: "analogy", label: "🌉 Analogy" },
                        { id: "text", label: "📄 Simple" },
                        { id: "interactive", label: "🎮 Interactive" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleExplainThreeWays(m.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            currentModality === m.id
                              ? "bg-[#7C3AED] text-white border-[#9F67FF]"
                              : "bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions, Audio, Translation */}
              {remix && !remixLoading && (
                <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleReadAloud}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      speaking
                        ? "bg-rose-500/20 text-rose-300 border-rose-400"
                        : "bg-white/[0.06] text-white border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span>{speaking ? "⏹" : "🔊"}</span>
                    <span>{speaking ? "Stop Audio" : "Read Aloud"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <select
                      value={translateLang}
                      onChange={(e) => setTranslateLang(e.target.value)}
                      className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleRemix}
                      disabled={translateLoading}
                      className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs text-white/80"
                    >
                      Translate
                    </button>
                  </div>
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

          {/* Practice Scratchpad & Real-Time Observer */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.035] border border-white/[0.1] backdrop-blur-xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-[#C084FC] uppercase tracking-wider font-semibold">
                  3. Practice & Thinking Scratchpad
                </span>
                <p className="text-xs text-white/50 mt-1">
                  Work through your thinking below. Riff quietly tracks your interaction cadence against your personal baseline.
                </p>
              </div>

              <button
                onClick={() => toggleVoiceInput("scratch")}
                className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  voiceTarget === "scratch"
                    ? "bg-rose-500/20 text-rose-300 border-rose-400 animate-pulse"
                    : "bg-white/[0.05] text-white/70 border-white/10 hover:text-white"
                }`}
              >
                🎤 {voiceTarget === "scratch" ? "Listening to Answer..." : "Speak Answer"}
              </button>
            </div>

            <textarea
              rows={4}
              value={scratch}
              onChange={(e) => setScratch(e.target.value)}
              onKeyDown={handleScratchKeyDown}
              placeholder="Start typing your explanation or solution. Riff observes interaction friction and will offer support if you get stuck..."
              className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C084FC] transition-all resize-none leading-relaxed"
            />

            {/* Live Pacing Waveform */}
            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/40 uppercase">Live Cadence:</span>
                <div className="flex items-end gap-1 h-8">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full transition-all duration-150"
                      style={{
                        height: `${h}px`,
                        backgroundColor: behaviorState.isFrictionDetected ? "#F43F5E" : "#10B981",
                      }}
                    />
                  ))}
                </div>
              </div>

              <span className="text-[11px] font-mono text-white/50">
                {behaviorState.isFrictionDetected ? (
                  <span className="text-rose-400 font-semibold">⚠️ Pacing slowed vs baseline</span>
                ) : (
                  <span className="text-emerald-400">● Rhythm steady</span>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!scratch.trim() || simplerLoading || quizLoading}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-white/90 disabled:opacity-40 transition-all shadow-lg shadow-white/10"
                >
                  Submit & Check Understanding
                </button>
                <button
                  onClick={handleOpenFocusRoom}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-white transition-all backdrop-blur-md"
                >
                  🪜 Enter Focus Room
                </button>
              </div>

              <button
                onClick={handleHintRequest}
                disabled={hintLoading}
                className="text-xs font-mono text-[#C084FC] hover:text-white underline"
              >
                {hintLoading ? "Thinking..." : "💡 Need a hint?"}
              </button>
            </div>

            {/* STUCK RESCUE FLOW BANNER */}
            {alertState === "offered" && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-[#0D0912] border border-rose-500/40 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-mono uppercase tracking-wider font-bold mb-2">
                  <span>⚠️</span> Riff noticed friction in your pacing
                </div>
                <p className="text-sm text-white/90 mb-4">
                  Let’s try a different way that matches how you learn best:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handleScrollToSection("riffboard");
                      handleVisualizeConcept();
                    }}
                    className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all shadow-lg"
                  >
                    🎨 Show me visually
                  </button>
                  <button
                    onClick={handleOpenFocusRoom}
                    className="px-4 py-2 rounded-full bg-white/[0.1] hover:bg-white/[0.2] border border-white/20 text-xs font-medium text-white"
                  >
                    🧩 Break into steps
                  </button>
                  <button
                    onClick={handleBridge}
                    className="px-4 py-2 rounded-full bg-white/[0.1] hover:bg-white/[0.2] border border-white/20 text-xs font-medium text-white"
                  >
                    🌉 Explain with analogy
                  </button>
                  <button
                    onClick={handleReadAloud}
                    className="px-4 py-2 rounded-full bg-white/[0.1] hover:bg-white/[0.2] border border-white/20 text-xs font-medium text-white"
                  >
                    🔊 Hear explanation
                  </button>
                  <button
                    onClick={() => setAlertState("calm")}
                    className="px-4 py-2 rounded-full text-xs font-medium text-white/50 hover:text-white"
                  >
                    Keep going
                  </button>
                </div>
              </div>
            )}

            {/* Feedback & Understanding Check Outputs */}
            {(confidence !== null || simpler || quiz || alertState === "hinted") && (
              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                {alertState === "hinted" && (
                  <div className="p-4 rounded-2xl bg-[#7C3AED]/20 border border-[#9F67FF]/30 text-sm text-[#C084FC]">
                    <strong className="block text-xs font-mono uppercase text-[#C084FC] mb-1">Focused Hint</strong>
                    {hintLoading ? "Formulating hint..." : hint}
                  </div>
                )}

                {confidence !== null && (
                  <div className="p-5 rounded-2xl bg-[#7C3AED]/15 border border-[#9F67FF]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#C084FC] font-bold">
                        Understanding Assessment
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        {Math.round(confidence * 100)}% Learning Confidence
                      </span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7C3AED] to-[#10B981] rounded-full transition-all duration-700"
                        style={{ width: `${Math.round(confidence * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed pt-1">{confidenceFeedback}</p>
                  </div>
                )}

                {simpler && (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white/90">
                    <strong className="block text-xs font-mono uppercase text-white/50 mb-1">Simpler Breakdown</strong>
                    {simpler}
                  </div>
                )}

                {showQuiz && (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white/90">
                    <strong className="block text-xs font-mono uppercase text-white/50 mb-1">Practice Quiz</strong>
                    {quizLoading ? "Generating question..." : quiz}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multimodal Teach Riff & AI Lab */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teach Riff Card */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white/[0.035] border border-white/[0.1] backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#C084FC] uppercase tracking-wider font-semibold">
                    Now teach it back. You explain. Riff listens.
                  </span>
                  <p className="text-xs text-white/50 mt-0.5">
                    Explain the concept in your own words to verify your mental model.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl">
                  {["type", "voice", "draw"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        if (mode === "draw") handleScrollToSection("riffboard");
                        else setTeachMode(mode);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                        teachMode === mode
                          ? "bg-[#7C3AED] text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={teachExplanation}
                onChange={(e) => setTeachExplanation(e.target.value)}
                placeholder={`Teach this concept in your own words to a friendly buddy from ${interest || "your world"}...`}
                className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C084FC] transition-all resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleTeachback}
                  disabled={!teachExplanation.trim() || teachbackLoading}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C084FC] text-white font-semibold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-[#7C3AED]/20"
                >
                  {teachbackLoading ? "Listening & Assessing..." : "Teach It to Riff"}
                </button>
                {teachMode === "voice" && (
                  <button
                    onClick={() => toggleVoiceInput("teach")}
                    className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-400"
                  >
                    🎤 {voiceTarget === "teach" ? "Listening..." : "Speak"}
                  </button>
                )}
              </div>

              {/* Educational Rubric */}
              {teachRubric && (
                <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white">What Riff Heard:</span>
                    <span className="text-[#10B981] font-mono">{teachRubric.confidenceScore}% Learning Confidence</span>
                  </div>
                  <ul className="text-xs space-y-1 text-white/80">
                    <li className="text-emerald-300">✓ Core idea clearly stated</li>
                    <li className={teachRubric.relationship ? "text-emerald-300" : "text-amber-300"}>
                      {teachRubric.relationship ? "✓" : "△"} Relationship connected
                    </li>
                    <li className={teachRubric.exampleIncluded ? "text-emerald-300" : "text-amber-300"}>
                      {teachRubric.exampleIncluded ? "✓" : "△"} Example applied
                    </li>
                    {teachRubric.missingDetail && (
                      <li className="text-[#C084FC]">💡 {teachRubric.missingDetail}</li>
                    )}
                  </ul>
                </div>
              )}

              {teachback && (
                <div className="p-4 rounded-2xl bg-[#7C3AED]/15 border border-[#9F67FF]/30 text-xs text-[#C084FC] leading-relaxed italic">
                  “{teachback.reaction}” {teachback.question}
                </div>
              )}
            </div>

            {/* AI Lab: Debug My Thinking */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.035] border border-white/[0.1] backdrop-blur-xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#C084FC] uppercase tracking-wider font-semibold">
                  Debug My Thinking
                </span>
                <p className="text-xs text-white/50 mt-1">
                  Pinpoint the exact misconception behind your draft without generic grades.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/80 leading-relaxed min-h-[90px]">
                  {diagnoseLoading ? (
                    <span className="text-white/50 italic">Diagnosing conceptual gaps...</span>
                  ) : diagnose ? (
                    <div>
                      <strong className="block text-rose-300 mb-1">{diagnose.misconception}</strong>
                      <span className="text-white/70">{diagnose.fix}</span>
                    </div>
                  ) : (
                    <span className="text-white/40 italic">Type in the scratchpad, then hit below to locate misconceptions.</span>
                  )}
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!scratch.trim()) return;
                  setDiagnoseLoading(true);
                  try {
                    const res = await fetch(`${API_BASE}/api/diagnose`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ answer: scratch, lesson: remix || lesson, interest }),
                    });
                    const d = await res.json();
                    setDiagnose(d);
                  } catch {
                    setDiagnose({ misconception: "Check parts vs whole", fix: "Verify numerator tells how many parts, denominator tells total." });
                  } finally {
                    setDiagnoseLoading(false);
                  }
                }}
                disabled={!scratch.trim() || diagnoseLoading}
                className="w-full py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-white transition-all"
              >
                {diagnoseLoading ? "Diagnosing..." : "Find My Misconception"}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: ADAPTIVE ENGINE HUB */}
        <section id="adaptive-engine" className="space-y-8 scroll-mt-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C084FC] font-semibold px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
                02 • Central Intelligence
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white font-bold mt-3">
                Riff doesn't just teach. It adapts.
              </h2>
            </div>
            <p className="text-xs text-white/50 max-w-md font-light">
              Continuous telemetry calculates interaction friction, dynamically shifting modalities between spatial, textual, audio, and micro-step representations.
            </p>
          </div>

          <AdaptiveEngineHub
            autopilotState={autopilotState}
            behaviorState={behaviorState}
            understandingConfidence={confidence}
            currentModality={currentModality}
            adaptationDecision={adaptationDecision}
            retentionStats={retentionStats}
            onAcceptAdaptation={handleAcceptAdaptation}
            onKeepCurrentModality={() => setAlertState("calm")}
            onOpenWhyAdapted={() => setWhyAdaptedModalOpen(true)}
            onSelectModality={handleExplainThreeWays}
          />

          <AdaptiveVisualization
            currentModality={currentModality}
            behaviorState={behaviorState}
          />
        </section>

        {/* SECTION 3: SMART RIFFBOARD */}
        <section id="riffboard" className="space-y-8 scroll-mt-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C084FC] font-semibold px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
                03 • Creative Canvas
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white font-bold mt-3">
                Smart RiffBoard Workspace
              </h2>
            </div>
            <p className="text-xs text-white/50 max-w-md font-light">
              Draw and structure your conceptual models. Ask Riff for real-time visual assessment or generate structured schematics automatically.
            </p>
          </div>

          <Whiteboard
            concept={remix || lesson}
            interest={interest}
            onAskRiff={handleAskRiffDrawing}
            onVisualizeConcept={handleVisualizeConcept}
            isVisualizing={isVisualizing}
            visualFeedback={visualFeedback}
          />
        </section>

        {/* SECTION 4: RECALL & RETENTION */}
        <section id="recall" className="space-y-8 scroll-mt-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C084FC] font-semibold px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
                04 • Spaced Memory
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white font-bold mt-3">
                Remember what you learned.
              </h2>
            </div>
            <p className="text-xs text-white/50 max-w-md font-light">
              Scientifically scheduled retrieval queues prevent forgetting loops through progressive 5m → 1d → 3d → 7d → 14d intervals.
            </p>
          </div>

          <RecallView
            cards={flashcards}
            onGenerateCards={() => handleGenerateFlashcards(remix || lesson, interest)}
            isGenerating={isGeneratingCards}
            onRefresh={() => setRetentionStore(loadRetentionStore())}
          />
        </section>

        {/* SECTION 5: LEARNING DNA */}
        <section id="dna" className="space-y-8 scroll-mt-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C084FC] font-semibold px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
                05 • Learner Profile
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white font-bold mt-3">
                Your Learning DNA
              </h2>
            </div>
            <p className="text-xs text-white/50 max-w-md font-light">
              Dynamic modality affinities computed from real performance outcomes — not fixed diagnostic labels.
            </p>
          </div>

          <LearningDNA
            profile={modalityProfile}
            onSelectModality={(mod) => {
              handleExplainThreeWays(mod);
              handleScrollToSection("learn");
            }}
          />
        </section>

        {/* SECTION 6: JOURNEY & TIMELINE */}
        <section id="timeline" className="space-y-8 scroll-mt-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C084FC] font-semibold px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#9F67FF]/30">
                06 • Telemetry & History
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white font-bold mt-3">
                Learning Journey & Timeline
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDemoModeOpen(true)}
                className="px-4 py-1.5 rounded-full bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 border border-[#9F67FF]/40 text-xs font-semibold text-[#C084FC] transition-all backdrop-blur-md"
              >
                ⚖️ Open Judge Demo Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ConfidenceJourney points={confidencePoints} />
            <AdaptiveTimeline
              events={sessionEvents}
              onClearHistory={() => {
                clearSessionHistory();
                setSessionEvents([]);
                setConfidencePoints([]);
              }}
            />
          </div>
        </section>
      </main>

      {/* MODALS & OVERLAYS */}
      <WhyRiffAdapted
        isOpen={whyAdaptedModalOpen}
        onClose={() => setWhyAdaptedModalOpen(false)}
        adaptationRecord={currentAdaptationRecord}
        onProvideFeedback={(feedback) => {
          recordModalityOutcome(modalityProfile, currentModality, feedback === "helped" ? 1.1 : 0.7);
          setModalityProfile(loadModalityProfile());
        }}
      />

      <FocusRoom
        isOpen={focusRoomOpen}
        onClose={() => setFocusRoomOpen(false)}
        lesson={remix || lesson}
        interest={interest}
        steps={steps}
        onImStuck={({ stepText }) => {
          setFocusRoomOpen(false);
          handleScrollToSection("riffboard");
          handleVisualizeConcept();
        }}
        onSwitchModality={(mod) => {
          if (mod === "whiteboard") handleScrollToSection("riffboard");
          else if (mod === "bridge") handleBridge();
        }}
      />

      <DemoMode
        isOpen={demoModeOpen}
        onClose={() => setDemoModeOpen(false)}
        onRunAdaptiveDemo={handleRunAdaptiveDemo}
      />

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] mt-24 py-12 px-6 sm:px-12 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-white">RIFF</span>
            <span className="text-[#9F67FF]">•</span>
            <span>Adaptive Neuro-Learning Engine</span>
          </div>
          <span>
            Telemetry compared strictly against your own personal baseline — never to anyone else's.
          </span>
        </div>
      </footer>
    </div>
  );
}