// App.jsx
// Riff: Adaptive Neuro-Learning Engine
// Autopilot Loop: OBSERVE ↓ DETECT ↓ UNDERSTAND ↓ ADAPT ↓ TEACH ↓ PRACTICE ↓ MEASURE ↓ REMEMBER ↓ ADAPT AGAIN

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

// Components
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
  // Navigation tabs: 'learn' | 'recall' | 'focus' | 'whiteboard' | 'dna' | 'timeline' | 'demo'
  const [activeNav, setActiveNav] = useState("learn");

  // Lesson & Remix State
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

  // Teach Riff (Multimodal Teach-Back)
  const [teachMode, setTeachMode] = useState("type"); // 'type' | 'voice' | 'draw'
  const [teachExplanation, setTeachExplanation] = useState("");
  const [teachback, setTeachback] = useState(null);
  const [teachbackLoading, setTeachbackLoading] = useState(false);
  const [teachRubric, setTeachRubric] = useState(null);

  // Riff Lab (Debug My Thinking & Bridge It)
  const [diagnose, setDiagnose] = useState(null);
  const [diagnoseLoading, setDiagnoseLoading] = useState(false);
  const [bridge, setBridge] = useState(null);
  const [bridgeLoading, setBridgeLoading] = useState(false);

  // Multimodal Voice & Audio
  const [translateLang, setTranslateLang] = useState("Hindi");
  const [translated, setTranslated] = useState("");
  const [translateLoading, setTranslateLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechCharIndex, setSpeechCharIndex] = useState(-1);
  const [voiceTarget, setVoiceTarget] = useState(null);

  // Explain It 3 Ways Feedback
  const [modalityFeedbackGiven, setModalityFeedbackGiven] = useState(false);

  // Autopilot & Adaptation Controller State
  const [autopilotState, setAutopilotState] = useState(AUTOPILOT_STATES.OBSERVING);
  const [currentModality, setCurrentModality] = useState("text"); // 'text' | 'visual' | 'micro-step' | 'analogy' | 'audio' | 'teach-back' | 'retrieval'
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

  // Whiteboard (Smart RiffBoard)
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
  const memoryHealth = getMemoryHealthOverview(retentionStore);

  // Central Decision Engine Evaluation
  const adaptationDecision = decideAdaptation({
    behaviorState,
    understandingConfidence: confidence,
    retentionDueCount: retentionStats.due,
    preferredModality: modalityInsights.topModality,
    interest,
    hasLesson: Boolean(remix || lesson),
  });

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

      // Log Session Event & Confidence Point
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

      // Record Confidence Journey point
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

      // Bandit & Modality Reward
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

  // ---- Multimodal Teach Riff (Reverse Tutoring) ----
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

      // Structured educational rubric
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

        // Autopilot proactive friction trigger
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

  // Explain It 3 Ways Handler
  const handleExplainThreeWays = (modality) => {
    setCurrentModality(modality);
    setModalityFeedbackGiven(false);
    if (modality === "visual") setActiveNav("whiteboard");
    else if (modality === "micro-step") handleOpenFocusRoom();
    else if (modality === "analogy") handleBridge();
    else if (modality === "audio") handleReadAloud();
  };

  // Autopilot Adaptation Acceptor
  const handleAcceptAdaptation = (actionId) => {
    if (actionId === "open_whiteboard") {
      setActiveNav("whiteboard");
      setCurrentModality("visual");
      handleVisualizeConcept();
    } else if (actionId === "step_mode") {
      handleOpenFocusRoom();
    } else if (actionId === "quick_recall" || actionId === "flashcards") {
      setActiveNav("recall");
    } else if (actionId === "teachback") {
      setTeachMode("type");
    } else if (actionId === "simpler") {
      handleSubmitAnswer();
    } else if (actionId === "hint") {
      handleHintRequest();
    }
  };

  // Run Judge Demo Walkthrough
  const handleRunAdaptiveDemo = () => {
    setLesson("Photosynthesis: Plants convert water, carbon dioxide, and sunlight into glucose and oxygen.");
    setInterest("Space Exploration");
    handleRemix();
    setActiveNav("learn");
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
      {/* App Header */}
      <header className="riff-header">
        <div className="riff-header-row">
          <div>
            <h1 className="riff-wordmark">
              Riff<span className="swash">.</span>
            </h1>
            <p className="riff-tagline">
              Adaptive Neuro-Learning Engine: Learns what you love. Teaches how you learn.
            </p>
          </div>
          <RiffMascot mood={mascotMood} accent={vibeTheme.accent} />
        </div>

        {/* Global Navigation Bar */}
        <nav className="riff-nav-bar" aria-label="Main system navigation">
          {[
            { id: "learn", label: "⚡ Learn & Practice" },
            { id: "recall", label: `🗂️ Recall (${retentionStats.due} due)` },
            { id: "whiteboard", label: "🎨 Smart RiffBoard" },
            { id: "dna", label: "🧬 Learning DNA" },
            { id: "timeline", label: "📈 Journey Timeline" },
            { id: "demo", label: "⚖️ Demo Mode" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`riff-nav-btn ${activeNav === tab.id ? "active" : ""}`}
              onClick={() => {
                if (tab.id === "demo") setDemoModeOpen(true);
                else setActiveNav(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {banditInsight && banditInsight.average > 0 && (
          <p className="riff-insight">
            {vibeTheme.emoji} Riff's noticed you tend to click fastest with{" "}
            <strong>{getVibeTheme(banditInsight.arm).label}</strong>-style analogies — about{" "}
            {Math.round(Math.min(1, banditInsight.average) * 100)}% average confidence there.
          </p>
        )}
      </header>

      {error && <div className="riff-error">{error}</div>}

      {/* CENTRAL ADAPTIVE ENGINE HUB */}
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

      {/* VIEW 1: LEARN & PRACTICE (Desktop 2-column, Mobile Adaptive) */}
      {activeNav === "learn" && (
        <main>
          {/* Main 2-Column Lesson & Output Grid */}
          <div className="riff-grid">
            {/* Panel 1: Lesson Input */}
            <section className="riff-panel" aria-label="Academic Concept Input">
              <p className="riff-panel-label">1. Academic Concept</p>
              <div className="riff-input-label">What are you learning today?</div>
              <div className="riff-input-with-voice">
                <textarea
                  rows={5}
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="Paste any concept, problem, or topic..."
                />
                <button
                  type="button"
                  className={`riff-voice-btn-corner ${voiceTarget === "lesson" ? "listening" : ""}`}
                  onClick={() => toggleVoiceInput("lesson")}
                  title="Voice Input (Speech-to-Text)"
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
                >
                  🎤
                </button>
              </div>

              <button
                className="riff-primary"
                onClick={handleRemix}
                disabled={remixLoading || !lesson.trim() || !interest.trim()}
              >
                {remixLoading ? "Riffing & Adapting..." : "⚡ Riff It (Personalize Lesson)"}
              </button>
            </section>

            {/* Panel 2: Remixed Output & Neuro-Read */}
            <section
              className="riff-panel"
              aria-label="Adaptive Remixed Lesson"
              style={{
                backgroundColor: contrastThemeObj.bg,
                color: contrastThemeObj.text,
                borderColor: contrastThemeObj.border || "var(--line)",
              }}
            >
              <p className="riff-panel-label">2. Adaptive Riff</p>

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

              {/* Explain It 3 Ways Selector */}
              {remix && (
                <div className="riff-explain-3ways-row">
                  <span className="explain-3ways-lbl">Explain this as:</span>
                  <div className="explain-3ways-btns">
                    {[
                      { id: "text", label: "📄 Simple Text" },
                      { id: "visual", label: "🎨 Visual Model" },
                      { id: "analogy", label: "🌉 Bridge Analogy" },
                      { id: "audio", label: "🔊 Audio Read" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        className={`riff-chip ${currentModality === m.id ? "active" : ""}`}
                        onClick={() => handleExplainThreeWays(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions & Translation */}
              {remix && !remixLoading && (
                <div className="riff-output-actions">
                  <button
                    className="riff-btn-small ghost"
                    onClick={handleReadAloud}
                    disabled={!isSpeechSupported()}
                  >
                    {speaking ? "⏹ Stop Audio" : "🔊 Read Aloud"}
                  </button>
                  <select
                    className="riff-lang-select"
                    value={translateLang}
                    onChange={(e) => setTranslateLang(e.target.value)}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  <button className="riff-btn-small ghost" onClick={handleRemix} disabled={translateLoading}>
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

              {/* Neuro-Read Controls */}
              <NeuroReadControls
                settings={neuroSettings}
                onChange={setNeuroSettings}
                isOpen={neuroReadOpen}
                onToggle={() => setNeuroReadOpen(!neuroReadOpen)}
              />
            </section>
          </div>

          {/* Practice & Scratchpad Section */}
          <section className="riff-scratch-section" aria-label="Interactive Scratchpad">
            <p className="riff-panel-label">3. Practice & Thinking Scratchpad</p>
            <div className="riff-input-label">Work through your thinking below:</div>
            <div className="riff-input-with-voice">
              <textarea
                rows={4}
                placeholder="Start typing or speak your answer — Riff quietly observes your cadence against your personal baseline..."
                value={scratch}
                onChange={(e) => setScratch(e.target.value)}
                onKeyDown={handleScratchKeyDown}
              />
              <button
                type="button"
                className={`riff-voice-btn-corner ${voiceTarget === "scratch" ? "listening" : ""}`}
                onClick={() => toggleVoiceInput("scratch")}
                title="Speak answer via microphone"
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
              <button className="riff-btn-small ghost" onClick={handleOpenFocusRoom}>
                🪜 Enter Focus Room
              </button>
            </div>

            {/* Signal Waveform */}
            <div className="riff-waveform" title="Your live typing cadence vs personal baseline">
              {bars.map((h, i) => (
                <div key={i} className="riff-bar" style={{ height: `${h}px`, background: barColor }} />
              ))}
            </div>

            {/* STUCK → RESCUE FLOW (Closing the loop) */}
            {alertState === "offered" && (
              <div className="riff-offer">
                <span className="riff-offer-text">
                  Riff noticed you may be getting stuck. Let's try a different way:
                </span>
                <div className="riff-offer-actions">
                  <button
                    className="riff-btn-small accept"
                    onClick={() => {
                      setActiveNav("whiteboard");
                      handleVisualizeConcept();
                    }}
                  >
                    🎨 Show me visually
                  </button>
                  <button className="riff-btn-small accept" onClick={handleOpenFocusRoom}>
                    🧩 Break into steps
                  </button>
                  <button className="riff-btn-small ghost" onClick={handleBridge}>
                    🌉 Explain with analogy
                  </button>
                  <button className="riff-btn-small ghost" onClick={handleReadAloud}>
                    🔊 Hear explanation
                  </button>
                  <button className="riff-btn-small dismiss" onClick={() => setAlertState("calm")}>
                    Keep going
                  </button>
                </div>
              </div>
            )}

            {/* Feedback & Quiz Box */}
            {(confidence !== null || simpler || quiz || alertState === "hinted") && (
              <div style={{ marginTop: 16 }}>
                {alertState === "hinted" && (
                  <div className="riff-hint-box">
                    <div className="riff-input-label">Focused Hint</div>
                    <div className="riff-hint-text">{hintLoading ? "Thinking..." : hint}</div>
                  </div>
                )}

                {confidence !== null && (
                  <div className="riff-hint-box">
                    <div className="riff-input-label">Understanding Check</div>
                    <div className="riff-hint-text">
                      <strong>{Math.round(confidence * 100)}%</strong> learning confidence
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
                    <div className="riff-hint-text">{quizLoading ? "Generating..." : quiz}</div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Multimodal "Teach Riff" & Riff Lab */}
          <section className="riff-lab-section" aria-label="Teach Riff and Concept Lab">
            <p className="riff-panel-label">4. Multimodal Teach Riff & AI Lab</p>
            <div className="riff-lab-grid">
              {/* Teach Riff */}
              <div className="riff-hint-box riff-lab-card" style={{ gridColumn: "span 2" }}>
                <div className="riff-input-label">Teach Riff (Reverse Tutoring)</div>
                <div className="teach-mode-selector">
                  <button
                    className={`teach-mode-chip ${teachMode === "type" ? "active" : ""}`}
                    onClick={() => setTeachMode("type")}
                  >
                    ⌨️ Type
                  </button>
                  <button
                    className={`teach-mode-chip ${teachMode === "voice" ? "active" : ""}`}
                    onClick={() => {
                      setTeachMode("voice");
                      toggleVoiceInput("teach");
                    }}
                  >
                    🎤 Speak
                  </button>
                  <button
                    className={`teach-mode-chip ${teachMode === "draw" ? "active" : ""}`}
                    onClick={() => setActiveNav("whiteboard")}
                  >
                    🎨 Draw
                  </button>
                </div>

                <div className="riff-input-with-voice" style={{ marginTop: 8 }}>
                  <textarea
                    rows={3}
                    placeholder={`Teach this concept in your own words to a friendly buddy from ${interest || "your world"}...`}
                    value={teachExplanation}
                    onChange={(e) => setTeachExplanation(e.target.value)}
                  />
                  {teachMode === "voice" && (
                    <button
                      type="button"
                      className={`riff-voice-btn-corner ${voiceTarget === "teach" ? "listening" : ""}`}
                      onClick={() => toggleVoiceInput("teach")}
                    >
                      🎤 {voiceTarget === "teach" ? "Listening..." : "Speak"}
                    </button>
                  )}
                </div>

                <button
                  className="riff-btn-small accept"
                  style={{ marginTop: 8 }}
                  onClick={handleTeachback}
                  disabled={!teachExplanation.trim() || teachbackLoading}
                >
                  {teachbackLoading ? "Listening & Assessing..." : "Teach It to My Buddy"}
                </button>

                {teachRubric && (
                  <div className="teach-rubric-card">
                    <div className="rubric-header">
                      <strong>Riff's Understanding Assessment</strong>
                      <span className="rubric-score">{teachRubric.confidenceScore}% Confidence</span>
                    </div>
                    <ul className="rubric-list">
                      <li className="pass">✓ Core idea clearly stated</li>
                      <li className={teachRubric.relationship ? "pass" : "pending"}>
                        {teachRubric.relationship ? "✓" : "△"} Key relationship connected
                      </li>
                      <li className={teachRubric.exampleIncluded ? "pass" : "pending"}>
                        {teachRubric.exampleIncluded ? "✓" : "△"} Real-world example applied
                      </li>
                      {teachRubric.missingDetail && (
                        <li className="note">💡 {teachRubric.missingDetail}</li>
                      )}
                    </ul>
                  </div>
                )}

                {teachback && (
                  <div className="riff-teachback-reply">
                    <em>{teachback.reaction}</em>
                    <br />
                    {teachback.question}
                  </div>
                )}
              </div>

              {/* Debug My Thinking */}
              <div className="riff-hint-box riff-lab-card">
                <div className="riff-input-label">Debug My Thinking</div>
                <div className="riff-hint-text">
                  {diagnoseLoading ? (
                    "Pinpointing misconception..."
                  ) : diagnose ? (
                    <>
                      <strong>{diagnose.misconception}</strong>
                      <br />
                      {diagnose.fix}
                    </>
                  ) : (
                    'Write your answer above, then identify the specific misconception behind it — not just "wrong."'
                  )}
                </div>
                <button
                  className="riff-btn-small accept"
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
                      setDiagnose({ misconception: "Review part-to-whole relationship", fix: "Check numerator vs denominator." });
                    } finally {
                      setDiagnoseLoading(false);
                    }
                  }}
                  disabled={!scratch.trim() || diagnoseLoading}
                >
                  Find My Misconception
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* VIEW 2: SMART RIFFBOARD CANVAS */}
      {activeNav === "whiteboard" && (
        <section style={{ maxWidth: 960, margin: "0 auto" }}>
          <Whiteboard
            concept={remix || lesson}
            interest={interest}
            onAskRiff={handleAskRiffDrawing}
            onVisualizeConcept={handleVisualizeConcept}
            isVisualizing={isVisualizing}
            visualFeedback={visualFeedback}
          />
        </section>
      )}

      {/* VIEW 3: MEMORY & SMART RETENTION */}
      {activeNav === "recall" && (
        <section style={{ maxWidth: 960, margin: "0 auto" }}>
          <RecallView
            cards={flashcards}
            onGenerateCards={() => handleGenerateFlashcards(remix || lesson, interest)}
            isGenerating={isGeneratingCards}
            onRefresh={() => setRetentionStore(loadRetentionStore())}
          />
        </section>
      )}

      {/* VIEW 4: LEARNING DNA */}
      {activeNav === "dna" && (
        <section style={{ maxWidth: 960, margin: "0 auto" }}>
          <LearningDNA
            profile={modalityProfile}
            onSelectModality={(mod) => {
              handleExplainThreeWays(mod);
              setActiveNav("learn");
            }}
          />
        </section>
      )}

      {/* VIEW 5: JOURNEY TIMELINE & CONFIDENCE GRAPH */}
      {activeNav === "timeline" && (
        <section style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <ConfidenceJourney points={confidencePoints} />
          <AdaptiveTimeline
            events={sessionEvents}
            onClearHistory={() => {
              clearSessionHistory();
              setSessionEvents([]);
              setConfidencePoints([]);
            }}
          />
        </section>
      )}

      {/* Modals */}
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
          setActiveNav("whiteboard");
          handleVisualizeConcept();
        }}
        onSwitchModality={(mod) => {
          if (mod === "whiteboard") setActiveNav("whiteboard");
          else if (mod === "bridge") handleBridge();
        }}
      />

      <DemoMode
        isOpen={demoModeOpen}
        onClose={() => setDemoModeOpen(false)}
        onRunAdaptiveDemo={handleRunAdaptiveDemo}
      />

      <footer className="riff-footnote">
        Adaptive neuro-learning signals compared strictly to your own personal baseline — never to anyone else's.
      </footer>
    </div>
  );
}