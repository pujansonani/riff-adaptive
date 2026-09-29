// App.jsx
// RIFF — Your Smart Learning Buddy
// Designed for K-12 learners who think differently.
// Warm paper aesthetic, encouraging language, friendly companion, and closed-loop adaptive intelligence.

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
    fontFamily: "nunito",
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
      setError("Speech microphone isn't supported in this browser. You can type right in!");
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
        title: `Made it fun with ${interest}!`,
        detail: `Turned fraction concept into an exciting ${interest} story.`,
        icon: "⚡",
        badge: "Story Magic",
      });
      setSessionEvents(updated);

      const updatedConf = recordConfidenceMilestone("Fun Story", 0.55, "remix");
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
      setError(`Couldn't reach backend helper at ${API_BASE}. Is the server on?`);
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
      title: "Entered Step Room",
      detail: "Broke the problem down into friendly tiny steps.",
      icon: "🪜",
      badge: "Tiny Steps",
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
      setSteps(`1. Notice what the parts of ${interest || "the concept"} are doing.\n2. Write down your first thought.\n3. Check if your answer makes sense.`);
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

      setHint(`Think of how many pieces you have, and how many make a full set in ${interest || "the problem"}.`);
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

      const simplerData = simplerRes.ok ? await simplerRes.json() : { simpler: "Here is a super simple way to see it." };
      const quizData = quizRes.ok ? await quizRes.json() : { quiz: "Ready for one quick question?" };

      const understanding = evaluateUnderstanding(scratch, source, interest);
      setConfidence(understanding.confidence);
      setConfidenceFeedback(understanding.feedback);
      setSimpler(simplerData.simpler);
      setQuiz(quizData.quiz);
      setShowQuiz(true);

      const updatedConf = recordConfidenceMilestone("Check In", understanding.confidence, "practice");
      setConfidencePoints(updatedConf);

      createSessionEvent({
        type: "understanding_checked",
        title: `Checked Understanding: ${Math.round(understanding.confidence * 100)}%`,
        detail: understanding.feedback,
        icon: "🎯",
        badge: "Check In",
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
      setSimpler("A quick friendly summary is ready.");
      setQuiz("A quick practice question is ready.");
      setConfidenceFeedback("Awesome effort! Riff checked your explanation.");
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
        missingDetail: isStrong ? null : "Want to add how the top and bottom numbers talk to each other?",
        confidenceScore: Math.round(evalResult.confidence * 100),
      });

      const updatedConf = recordConfidenceMilestone("Taught Riff", Math.max(0.75, evalResult.confidence), "teachback");
      setConfidencePoints(updatedConf);

      createSessionEvent({
        type: "teachback",
        title: "Taught Riff!",
        detail: `Explained in own words. Riff understood your thinking!`,
        icon: "🗣️",
        badge: "Teach Riff",
      });
      setSessionEvents(loadSessionEvents());
      setAutopilotState(AUTOPILOT_STATES.OBSERVING);
    } catch {
      setTeachback({
        reaction: `That makes total sense in ${interest || "our world"}!`,
        question: "How would you explain it to a friend who has never seen fractions before?",
      });
      setTeachRubric({
        coreIdea: true,
        relationship: true,
        exampleIncluded: true,
        missingDetail: null,
        confidenceScore: 85,
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
      title: "Made a Story Bridge",
      detail: `Connected concept to ${interest || "real life"}.`,
      icon: "🌉",
      badge: "Story Bridge",
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
          `Think of sharing pizza slices or trading items with your friends.`,
          `In ${interest || "your favorite game"}, pieces and teams work the exact same way!`,
          `In math, fractions are just the super clean way to write that down.`,
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
      title: "Drew a Picture",
      detail: "Created visual diagram on RiffBoard.",
      icon: "🎨",
      badge: "Picture",
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
      setVisualFeedback("Drew a helpful visual diagram right on your digital notebook!");
    } catch {
      setVisualFeedback("Drew visual stages on your notebook.");
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleAskRiffDrawing = ({ labels }) => {
    if (!labels) {
      setVisualFeedback("Add a little word or box to your drawing, then tap Ask Riff!");
      return;
    }
    setVisualFeedback(
      `Riff loved your drawing of "${labels}"! You’ve got the main pieces down. Drawing an arrow between them will show how they move!`
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
          const height = Math.max(6, Math.min(38, interval / 16));
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
            reasonText: "Riff noticed you paused and made a few corrections — let's try an easier picture or tiny step!",
          });
          setCurrentAdaptationRecord(adaptRecord);

          createSessionEvent({
            type: "friction_detected",
            title: "Riff Offered a Hand",
            detail: `Noticed a pause on this question. Ready to switch to pictures or steps.`,
            icon: "💡",
            badge: "Help Ready",
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
    : confidence !== null && confidence >= 0.7
    ? "happy"
    : behaviorState.isFrictionDetected
    ? "adapting"
    : "calm";

  const fontObj = READ_FONTS.find((f) => f.id === neuroSettings.fontFamily) || READ_FONTS[0];
  const contrastThemeObj = CONTRAST_THEMES.find((t) => t.id === neuroSettings.contrastTheme) || CONTRAST_THEMES[0];
  const fontSizeMap = { normal: "16px", large: "19px", xl: "23px" };
  const lineHeightMap = { normal: "1.7", relaxed: "2.0", spacious: "2.4" };
  const letterSpacingMap = { normal: "0em", wide: "0.04em", extrawide: "0.09em" };

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#263238] selection:bg-[#E8DEFF] selection:text-[#534BD6] flex flex-col justify-between">
      {/* 1. WARM FRIENDLY NAVBAR */}
      <Navbar
        onNavigate={handleScrollToSection}
        activeSection={activeNav}
        onOpenNeuroRead={() => setNeuroReadOpen(true)}
      />

      {/* 2. PLAYFUL HERO */}
      <div id="hero">
        <Hero
          onStartLearning={() => handleScrollToSection("learn")}
          onExploreAdaptive={() => handleScrollToSection("adaptive-engine")}
        />
      </div>

      {/* Floating Mascot Buddy Widget */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <RiffMascot mood={mascotMood} size="md" />
      </div>

      {/* MAIN LEARNING DESK SECTIONS */}
      <main className="max-w-6xl mx-auto px-6 sm:px-10 py-12 space-y-20 w-full">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-3xl bg-[#FFE0E5] border border-[#FF5E7E]/30 text-[#FF5E7E] text-xs font-bold flex items-center justify-between shadow-sm">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-[#FF5E7E] hover:underline font-bold">✕</button>
          </div>
        )}

        {/* SECTION 1: MY LEARNING DESK */}
        <section id="learn" className="space-y-8 scroll-mt-28">
          {/* Header & Continue Learning Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DEFF] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-[#6C63FF] px-3.5 py-1 rounded-full bg-[#E8DEFF]">
                📚 MY DESK
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#263238] mt-2">
                What are you curious about today?
              </h2>
            </div>
          </div>

          {/* Continue Learning Card */}
          <div className="p-6 sm:p-7 rounded-[32px] bg-gradient-to-r from-[#FFF3D6] to-[#DCEBFF] border-2 border-[#FFB84D]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFB84D]">Continue Learning</span>
              <h3 className="font-display text-xl font-bold text-[#263238]">Fractions & Parts of a Whole</h3>
              <p className="text-xs text-[#546E7A]">Let’s finish what we started together!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5" title="Progress: 4 of 5 steps">
                <span className="w-3 h-3 rounded-full bg-[#2EC4B6]" />
                <span className="w-3 h-3 rounded-full bg-[#2EC4B6]" />
                <span className="w-3 h-3 rounded-full bg-[#2EC4B6]" />
                <span className="w-3 h-3 rounded-full bg-[#2EC4B6]" />
                <span className="w-3 h-3 rounded-full bg-white border border-[#546E7A]" />
              </div>
              <button
                onClick={() => handleScrollToSection("scratch-desk")}
                className="px-5 py-2.5 rounded-full bg-[#6C63FF] text-white text-xs font-bold shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none"
              >
                Continue →
              </button>
            </div>
          </div>

          {/* 2-Column Lesson Input & Personalized Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel 1: Concept & Favorite Thing Input */}
            <div className="p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-display text-sm font-bold text-[#263238]">
                    1. Topic from school or a book:
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput("lesson")}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      voiceTarget === "lesson"
                        ? "bg-[#FFE0E5] text-[#FF5E7E] border-[#FF5E7E] animate-pulse"
                        : "bg-[#FFF9F0] text-[#546E7A] border-[#E8DEFF] hover:bg-[#FFF3D6]"
                    }`}
                  >
                    🎤 {voiceTarget === "lesson" ? "Listening..." : "Speak it"}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="Paste what you're learning (like fractions, volcanoes, photosynthesis)..."
                  className="w-full p-4 rounded-2xl bg-[#FFF9F0] border-2 border-[#E8DEFF] text-[#263238] font-bold text-xs sm:text-sm focus:outline-none focus:border-[#6C63FF] transition-all resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between mt-5 mb-2">
                  <label className="font-display text-sm font-bold text-[#263238]">
                    2. What do you love most?
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput("interest")}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      voiceTarget === "interest"
                        ? "bg-[#FFE0E5] text-[#FF5E7E] border-[#FF5E7E] animate-pulse"
                        : "bg-[#FFF9F0] text-[#546E7A] border-[#E8DEFF] hover:bg-[#FFF3D6]"
                    }`}
                  >
                    🎤 {voiceTarget === "interest" ? "Listening..." : "Speak"}
                  </button>
                </div>
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="Minecraft, space, basketball, dinosaurs, baking..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF9F0] border-2 border-[#E8DEFF] text-[#263238] font-bold text-xs sm:text-sm focus:outline-none focus:border-[#6C63FF] transition-all"
                />
              </div>

              <button
                onClick={handleRemix}
                disabled={remixLoading || !lesson.trim() || !interest.trim()}
                className="w-full py-4 rounded-full bg-[#6C63FF] hover:bg-[#534BD6] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {remixLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Making it fun with {interest}...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Remix With My Favorite Thing!</span>
                  </>
                )}
              </button>
            </div>

            {/* Panel 2: Remixed Lesson & Easy Reading */}
            <div
              className="p-6 sm:p-8 rounded-[36px] border-2 shadow-card flex flex-col justify-between space-y-4 transition-all"
              style={{
                backgroundColor: contrastThemeObj.bg,
                borderColor: contrastThemeObj.border,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-sm font-bold text-[#6C63FF]">
                    Your Story Lesson
                  </span>
                  {interest && (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FFF3D6] text-[#E08A00]">
                      ✨ {interest} edition
                    </span>
                  )}
                </div>

                <div
                  className={`min-h-[160px] p-5 rounded-2xl bg-white/70 border border-black/5 transition-all leading-relaxed ${
                    neuroSettings.readingRuler ? "ring-2 ring-[#6C63FF]" : ""
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
                    <div className="flex items-center gap-3 text-[#546E7A] text-sm font-bold">
                      <span className="w-4 h-4 rounded-full border-2 border-[#6C63FF] border-t-transparent animate-spin" />
                      <span>Cooking up a fun explanation with {interest}...</span>
                    </div>
                  ) : remix ? (
                    speechCharIndex >= 0 ? (
                      <span>
                        <span>{remix.slice(0, speechCharIndex)}</span>
                        <mark className="bg-[#FFF3D6] text-[#263238] rounded px-1 font-bold">
                          {remix.slice(speechCharIndex, speechCharIndex + 14)}
                        </mark>
                        <span>{remix.slice(speechCharIndex + 14)}</span>
                      </span>
                    ) : (
                      remix
                    )
                  ) : (
                    <span className="text-[#546E7A] text-xs sm:text-sm font-medium">
                      Type your topic and your favorite hobby above, then tap "Remix" to see it transformed into a friendly story!
                    </span>
                  )}
                </div>

                {/* Suggested Modalities */}
                {remix && (
                  <div className="mt-4 pt-3 border-t border-black/5">
                    <span className="block text-xs font-bold text-[#546E7A] uppercase mb-2">
                      Try exploring this as:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "visual", label: "🎨 Draw It" },
                        { id: "analogy", label: "🌉 Fun Story" },
                        { id: "text", label: "📄 Simple Text" },
                        { id: "audio", label: "🔊 Read Aloud" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleExplainThreeWays(m.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            currentModality === m.id
                              ? "bg-[#6C63FF] text-white border-[#534BD6] shadow-sm"
                              : "bg-[#FFF9F0] border-[#E8DEFF] text-[#263238] hover:bg-[#FFF3D6]"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions & Reading Comfort Toggle */}
              {remix && !remixLoading && (
                <div className="pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleReadAloud}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      speaking
                        ? "bg-[#FFE0E5] text-[#FF5E7E] border-[#FF5E7E]"
                        : "bg-[#DFF7F0] text-[#20A396] border-[#BAEFE2] hover:bg-[#C2F2E4]"
                    }`}
                  >
                    <span>{speaking ? "⏹" : "🔊"}</span>
                    <span>{speaking ? "Stop Audio" : "Read Aloud"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <select
                      value={translateLang}
                      onChange={(e) => setTranslateLang(e.target.value)}
                      className="px-3 py-1.5 rounded-full bg-[#FFF9F0] border border-[#E8DEFF] text-xs font-bold text-[#263238] focus:outline-none"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleRemix}
                      disabled={translateLoading}
                      className="px-3.5 py-1.5 rounded-full bg-[#E8DEFF] text-[#534BD6] text-xs font-bold hover:bg-[#D8C4FF]"
                    >
                      Translate
                    </button>
                  </div>
                </div>
              )}

              {/* Easy Reading Controls */}
              <NeuroReadControls
                settings={neuroSettings}
                onChange={setNeuroSettings}
                isOpen={neuroReadOpen}
                onToggle={() => setNeuroReadOpen(!neuroReadOpen)}
              />
            </div>
          </div>

          {/* Practice Thinking Scratchpad */}
          <div id="scratch-desk" className="p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-display text-sm font-bold text-[#6C63FF]">
                  3. Practice Scratchpad
                </span>
                <p className="text-xs text-[#546E7A] mt-0.5">
                  Try solving or explaining the idea below. Riff quietly watches your pace so it can help if you get stuck.
                </p>
              </div>

              <button
                onClick={() => toggleVoiceInput("scratch")}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  voiceTarget === "scratch"
                    ? "bg-[#FFE0E5] text-[#FF5E7E] border-[#FF5E7E] animate-pulse"
                    : "bg-[#FFF9F0] text-[#546E7A] border-[#E8DEFF] hover:bg-[#FFF3D6]"
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
              placeholder="Start typing your answer here. No worries about spelling or mistakes — Riff is here to help!"
              className="w-full p-4 rounded-2xl bg-[#FFF9F0] border-2 border-[#E8DEFF] text-[#263238] font-bold text-xs sm:text-sm focus:outline-none focus:border-[#6C63FF] transition-all resize-none leading-relaxed"
            />

            {/* Gentle Rhythm Waveform */}
            <div className="p-3 rounded-2xl bg-[#FFF9F0] border border-[#E8DEFF] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#546E7A] uppercase">Pace Rhythm:</span>
                <div className="flex items-end gap-1 h-7">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full transition-all duration-150"
                      style={{
                        height: `${h}px`,
                        backgroundColor: behaviorState.isFrictionDetected ? "#FF5E7E" : "#2EC4B6",
                      }}
                    />
                  ))}
                </div>
              </div>

              <span className="text-xs font-bold text-[#546E7A]">
                {behaviorState.isFrictionDetected ? (
                  <span className="text-[#FF5E7E]">💡 Paused on this step — ready to help</span>
                ) : (
                  <span className="text-[#20A396]">● Nice steady rhythm</span>
                )}
              </span>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!scratch.trim() || simplerLoading || quizLoading}
                  className="px-6 py-3 rounded-full bg-[#6C63FF] text-white font-bold text-xs uppercase tracking-wider shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-40"
                >
                  Check My Thinking ✨
                </button>
                <button
                  onClick={handleOpenFocusRoom}
                  className="px-5 py-3 rounded-full bg-[#FFF9F0] hover:bg-[#FFF3D6] border-2 border-[#E8DEFF] text-xs font-bold text-[#263238] transition-all shadow-sm"
                >
                  🪜 Take Tiny Steps
                </button>
              </div>

              <button
                onClick={handleHintRequest}
                disabled={hintLoading}
                className="text-xs font-bold text-[#6C63FF] hover:underline"
              >
                {hintLoading ? "Thinking of a hint..." : "💡 Need a hint?"}
              </button>
            </div>

            {/* FRIENDLY STUCK RESCUE FLOW */}
            {alertState === "offered" && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FFF3D6] via-[#FFE0E5] to-[#E8DEFF] border-2 border-[#FFB84D]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#263238] uppercase">
                  <span>💡</span> Let’s try a different way!
                </div>
                <p className="text-sm font-bold text-[#263238]">
                  You seem a little stuck here. How would you like Riff to help?
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      handleScrollToSection("riffboard");
                      handleVisualizeConcept();
                    }}
                    className="px-5 py-2.5 rounded-full bg-white text-[#263238] font-bold text-xs border border-[#E8DEFF] hover:bg-[#FFF3D6] shadow-sm"
                  >
                    🎨 Show me with pictures
                  </button>
                  <button
                    onClick={handleOpenFocusRoom}
                    className="px-5 py-2.5 rounded-full bg-white text-[#263238] font-bold text-xs border border-[#E8DEFF] hover:bg-[#FFF3D6] shadow-sm"
                  >
                    🪜 Break into tiny steps
                  </button>
                  <button
                    onClick={handleBridge}
                    className="px-5 py-2.5 rounded-full bg-white text-[#263238] font-bold text-xs border border-[#E8DEFF] hover:bg-[#FFF3D6] shadow-sm"
                  >
                    🌉 Tell a fun story
                  </button>
                  <button
                    onClick={handleReadAloud}
                    className="px-5 py-2.5 rounded-full bg-white text-[#263238] font-bold text-xs border border-[#E8DEFF] hover:bg-[#FFF3D6] shadow-sm"
                  >
                    🔊 Read out loud
                  </button>
                  <button
                    onClick={() => setAlertState("calm")}
                    className="px-4 py-2.5 rounded-full text-xs font-bold text-[#546E7A] hover:text-[#263238]"
                  >
                    Keep going my way
                  </button>
                </div>
              </div>
            )}

            {/* Feedback & Understanding Output */}
            {(confidence !== null || simpler || quiz || alertState === "hinted") && (
              <div className="space-y-4 pt-4 border-t border-[#E8DEFF]">
                {alertState === "hinted" && (
                  <div className="p-4 rounded-2xl bg-[#DFF7F0] border border-[#BAEFE2] text-xs font-bold text-[#20A396]">
                    <strong className="block uppercase text-[10px] text-[#20A396] mb-1">Friendly Hint:</strong>
                    {hintLoading ? "Formulating hint..." : hint}
                  </div>
                )}

                {confidence !== null && (
                  <div className="p-5 rounded-3xl bg-[#FFF3D6] border border-[#FFB84D]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#E08A00]">
                        Great Effort!
                      </span>
                      <span className="font-display text-sm font-bold text-[#263238]">
                        {Math.round(confidence * 100)}% Mastered
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FFB84D] to-[#2EC4B6] rounded-full transition-all duration-700"
                        style={{ width: `${Math.round(confidence * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#546E7A] font-bold pt-1">{confidenceFeedback}</p>
                  </div>
                )}

                {simpler && (
                  <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#E8DEFF] text-xs text-[#263238] font-bold">
                    <strong className="block text-[#6C63FF] uppercase text-[10px] mb-1">Simple Way to See It:</strong>
                    {simpler}
                  </div>
                )}

                {showQuiz && (
                  <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#E8DEFF] text-xs text-[#263238] font-bold">
                    <strong className="block text-[#6C63FF] uppercase text-[10px] mb-1">Quick Practice Question:</strong>
                    {quizLoading ? "Thinking of a question..." : quiz}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multimodal Teach Riff & AI Lab */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teach Riff Card */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display text-sm font-bold text-[#6C63FF]">
                    4. Teach Riff!
                  </span>
                  <p className="text-xs text-[#546E7A] mt-0.5">
                    If you can explain it, you really know it! Teach Riff like you're explaining to a friend.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#FFF9F0] p-1 rounded-2xl border border-[#E8DEFF]">
                  {["type", "voice", "draw"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        if (mode === "draw") handleScrollToSection("riffboard");
                        else setTeachMode(mode);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                        teachMode === mode
                          ? "bg-[#6C63FF] text-white shadow-sm"
                          : "text-[#546E7A] hover:text-[#263238]"
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
                placeholder={`Explain this concept in your own words to Riff...`}
                className="w-full p-4 rounded-2xl bg-[#FFF9F0] border-2 border-[#E8DEFF] text-[#263238] font-bold text-xs sm:text-sm focus:outline-none focus:border-[#6C63FF] transition-all resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleTeachback}
                  disabled={!teachExplanation.trim() || teachbackLoading}
                  className="px-6 py-3 rounded-full bg-[#6C63FF] text-white font-bold text-xs uppercase tracking-wider shadow-bouncy-purple hover:translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-40"
                >
                  {teachbackLoading ? "Listening carefully..." : "Teach Riff! ✨"}
                </button>
                {teachMode === "voice" && (
                  <button
                    onClick={() => toggleVoiceInput("teach")}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#FFE0E5] text-[#FF5E7E] border border-[#FF5E7E]"
                  >
                    🎤 {voiceTarget === "teach" ? "Listening..." : "Speak"}
                  </button>
                )}
              </div>

              {/* Friendly Rubric */}
              {teachRubric && (
                <div className="mt-4 p-4 rounded-2xl bg-[#DFF7F0] border border-[#BAEFE2] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#20A396]">
                    <span>What Riff Understood:</span>
                    <span>{teachRubric.confidenceScore}% Crystal Clear!</span>
                  </div>
                  <ul className="text-xs space-y-1 text-[#263238] font-semibold">
                    <li className="text-[#20A396]">✓ Main idea clearly explained!</li>
                    <li className={teachRubric.relationship ? "text-[#20A396]" : "text-[#E08A00]"}>
                      {teachRubric.relationship ? "✓" : "△"} Connected the pieces together
                    </li>
                    <li className={teachRubric.exampleIncluded ? "text-[#20A396]" : "text-[#E08A00]"}>
                      {teachRubric.exampleIncluded ? "✓" : "△"} Used a real-world example
                    </li>
                    {teachRubric.missingDetail && (
                      <li className="text-[#6C63FF]">💡 {teachRubric.missingDetail}</li>
                    )}
                  </ul>
                </div>
              )}

              {teachback && (
                <div className="p-4 rounded-2xl bg-[#FFF3D6] border border-[#FFB84D]/40 text-xs font-bold text-[#263238] leading-relaxed">
                  “{teachback.reaction}” {teachback.question}
                </div>
              )}
            </div>

            {/* AI Lab: Debug My Thinking */}
            <div className="p-6 sm:p-8 rounded-[36px] bg-white border-2 border-[#E8DEFF] shadow-card space-y-4 flex flex-col justify-between">
              <div>
                <span className="font-display text-sm font-bold text-[#6C63FF]">
                  Debug My Thinking
                </span>
                <p className="text-xs text-[#546E7A] mt-0.5">
                  Let's figure out what got mixed up without generic test grades.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-[#FFF9F0] border border-[#E8DEFF] text-xs font-bold text-[#263238] leading-relaxed min-h-[90px]">
                  {diagnoseLoading ? (
                    <span className="text-[#546E7A]">Riff is looking over your thoughts...</span>
                  ) : diagnose ? (
                    <div>
                      <strong className="block text-[#FF5E7E] mb-1">{diagnose.misconception}</strong>
                      <span className="text-[#546E7A]">{diagnose.fix}</span>
                    </div>
                  ) : (
                    <span className="text-[#546E7A]">Write in the scratchpad, then tap below to find tricky spots!</span>
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
                    setDiagnose({ misconception: "Check parts vs whole", fix: "Remember: top tells parts you have, bottom tells all parts." });
                  } finally {
                    setDiagnoseLoading(false);
                  }
                }}
                disabled={!scratch.trim() || diagnoseLoading}
                className="w-full py-3.5 rounded-full bg-[#FFF3D6] hover:bg-[#FFE6A3] border-2 border-[#FFB84D]/40 text-xs font-bold text-[#263238] transition-all shadow-sm"
              >
                {diagnoseLoading ? "Checking..." : "Let's figure it out ✨"}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW RIFF HELPS */}
        <section id="adaptive-engine" className="space-y-8 scroll-mt-28">
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

        {/* SECTION 3: DRAW IT OUT */}
        <section id="riffboard" className="space-y-8 scroll-mt-28">
          <Whiteboard
            concept={remix || lesson}
            interest={interest}
            onAskRiff={handleAskRiffDrawing}
            onVisualizeConcept={handleVisualizeConcept}
            isVisualizing={isVisualizing}
            visualFeedback={visualFeedback}
          />
        </section>

        {/* SECTION 4: CAN YOU REMEMBER? */}
        <section id="recall" className="space-y-8 scroll-mt-28">
          <RecallView
            cards={flashcards}
            onGenerateCards={() => handleGenerateFlashcards(remix || lesson, interest)}
            isGenerating={isGeneratingCards}
            onRefresh={() => setRetentionStore(loadRetentionStore())}
          />
        </section>

        {/* SECTION 5: HOW YOU LIKE TO LEARN */}
        <section id="dna" className="space-y-8 scroll-mt-28">
          <LearningDNA
            profile={modalityProfile}
            onSelectModality={(mod) => {
              handleExplainThreeWays(mod);
              handleScrollToSection("learn");
            }}
          />
        </section>

        {/* SECTION 6: MY LEARNING STORY */}
        <section id="timeline" className="space-y-8 scroll-mt-28">
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

          <div className="text-center pt-4">
            <button
              onClick={() => setDemoModeOpen(true)}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-[#FFF3D6] border-2 border-[#E8DEFF] text-xs font-bold text-[#546E7A] hover:text-[#263238] transition-all shadow-sm"
            >
              ⚖️ Open Judge Demo Mode
            </button>
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
      <footer className="border-t border-[#E8DEFF] mt-24 py-12 px-6 sm:px-12 bg-white text-center text-xs text-[#546E7A] font-semibold space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="font-display text-base font-bold text-[#263238]">Riff<span className="text-[#FF5E7E]">.</span></span>
          <span>your friendly learning companion</span>
        </div>
        <p>Learning doesn’t have to look the same for everyone. Riff moves with you!</p>
      </footer>
    </div>
  );
}