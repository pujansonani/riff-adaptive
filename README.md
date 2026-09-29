# Riff: Adaptive Neuro-Learning Engine

**Riff doesn’t wait for a learner to fail. It notices when the current way of learning isn’t working and changes the way it teaches.**

---

## Overview

Riff is an intelligent adaptive learning engine designed for **neurodivergent K–12 learners**—especially students who may experience difficulty with task initiation, reading density, cognitive fatigue, maintaining focus, understanding abstract concepts, or retaining information over time.

Riff is **one unified adaptive system**, not a disconnected collection of tools. It observes how an individual learner interacts in real-time, detects emerging friction, dynamically shifts its teaching modality, measures comprehension through reverse tutoring, and locks in concepts via spaced retrieval.

---

## Central Adaptive Loop

```
  ┌────────────────────────────────────────────────────────┐
  │                        OBSERVE                         │
  │   RiffSense monitors typing cadence, pause latency,    │
  │   revision bursts, and idle duration vs own baseline   │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                         DETECT                         │
  │   ML classifier estimates cognitive friction state:    │
  │   focused · uncertain · struggling · disengaging       │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                       UNDERSTAND                       │
  │   Evaluates conceptual alignment, keyword coverage,    │
  │   and misconception root cause                         │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                         ADAPT                          │
  │   RiffAdapt selects best pedagogical strategy:         │
  │   visual canvas, micro-steps, analogy bridge, audio    │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                         TEACH                          │
  │   Multimodal presentation: text, synchronized speech,  │
  │   schematic diagrams, and Neuro-Read typography        │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                        PRACTICE                        │
  │   Scratchpad with live waveform, Smart RiffBoard,      │
  │   Multimodal Teach Riff (type, voice, draw)            │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                        MEASURE                         │
  │   Measures student comprehension gain & updates        │
  │   Learning DNA modality affinity profile               │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                        REMEMBER                        │
  │   Smart Spaced Repetition (5m → 1d → 3d → 7d → 14d)    │
  │   adjusts intervals based on recall performance        │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                      ADAPT AGAIN                       │
  │   Feedback loop continuously refines learner model     │
  └────────────────────────────────────────────────────────┘
```

---

## Important Non-Clinical Commitment

> **Riff is an educational intelligence tool, not a medical diagnostic system.**
> Riff detects interaction friction and learning patterns—it does **NOT** diagnose ADHD, dyslexia, autism, or any clinical condition.
> All feedback is supportive and non-judgmental:
> - *"Riff noticed you may be getting stuck. Let's try another way."*
> - *"Let's make this easier: start with just this one step."*
> - *"Riff is learning what works best for you."*

---

## Core Architecture & Subsystems

| Capability | Module | Role in Adaptive Loop |
|---|---|---|
| **RiffSense** | `learningSignals.js` + `frictionModel.js` | Observes keystroke pacing, pause variance, and revision bursts strictly against the student's personal baseline. |
| **RiffAdapt** | `adaptationEngine.js` | Central decision engine that routes between text, visual, micro-step, analogy, audio, and recall modalities. |
| **RiffFocus** | `FocusRoom.jsx` | Immersive, de-cluttered single-task focus room with audio narration, whiteboard shortcut, and "I'm stuck" feedback. |
| **Smart RiffBoard** | `Whiteboard.jsx` | Pure HTML5 Canvas whiteboard with drawing tools, shapes, auto-concept visualizer (`/api/visualize`), and Socratic "Ask Riff" feedback. |
| **Neuro-Read** | `NeuroReadControls.jsx` | Accessible typography controls (font scaling, line/letter spacing, Lexend/Accessible Sans, contrast themes, reading ruler, bionic focus). |
| **RiffRecall** | `retentionEngine.js` + `RecallView.jsx` | Adaptive spaced repetition engine with 3D flip flashcards, memory health overview, and active recall tests. |
| **Teach Riff** | `App.jsx` | Multimodal reverse tutoring (Type, Voice 🎤, Draw 🎨) with structured 4-part rubric evaluation. |
| **Explainable AI** | `WhyRiffAdapted.jsx` | Transparent explainability layer showing exact observed behavioral signals and pedagogical rationale. |
| **Learning DNA** | `LearningDNA.jsx` | Visual distribution of dynamic modality affinities based on recent learning outcomes. |
| **Confidence Journey** | `ConfidenceJourney.jsx` | Real-time graph of conceptual learning confidence progression throughout the session. |
| **Adaptive Timeline** | `AdaptiveTimeline.jsx` | Chronological record of session milestones, friction alerts, and strategy shifts. |
| **Judge Demo Mode** | `DemoMode.jsx` | Comparative demonstration: Static "Without Riff" vs. Continuous "With Riff". |

---

## API Endpoints

| Endpoint | Method | Description | Safe Fallback |
|---|---|---|---|
| `/api/remix` | `POST` | Rewrites lesson through the lens of student's interest | Deterministic interest template |
| `/api/steps` | `POST` | Breaks content into numbered micro-steps | Deterministic step sequencer |
| `/api/hint` | `POST` | Contextual hint tailored to detected friction signals | Rule-based behavior hint |
| `/api/simpler` | `POST` | Simpler concise rewording for clarity | Concise plain summary |
| `/api/quiz` | `POST` | 3 practice quiz questions | Topic practice questions |
| `/api/diagnose` | `POST` | Pinpoints specific misconception and target fix | Structured gap analysis |
| `/api/bridge` | `POST` | 3-step analogy chain (Everyday → Interest → Concept) | Analogy bridge chain |
| `/api/teachback` | `POST` | Socratic reverse tutoring character response | Educational probe question |
| `/api/translate` | `POST` | Multilingual translation (Hindi, Spanish, French, etc.) | Target language output |
| `/api/flashcards` | `POST` | Generates structured Q&A cards with interest hints | Deterministic sentence cards |
| `/api/visualize` | `POST` | Structured schematic diagram nodes & connector arrows | 3-stage canvas visual model |
| `/api/recall` | `POST` | Retrieval practice challenge questions | Topic retrieval check |
| `/api/vibe` | `POST` | Interest theme classification (12 categories) | Keyword regex matcher |
| `/api/health` | `GET` | Health check endpoint | `{ ok: true }` |

---

## LocalStorage Namespaces

All learner data is kept strictly on-device:
- `riff_behavior_baseline_v1`: Personal typing speed and pause variance statistics.
- `riff_learning_profile_v1`: Dynamic modality affinity weights.
- `riff_recall_v1`: Spaced repetition flashcards, levels, and review history.
- `riff_session_events_v1`: Real-time session journey events.
- `riff_learning_confidence_v1`: Session confidence progression points.
- `riff_bandit_v1`: Interest bandit state.

---

## Getting Started

```bash
# 1. Install dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# 2. Start fullstack dev servers (Concurrently runs backend & frontend)
npm run dev

# 3. Run complete unit test suite (34 automated tests)
npm test

# 4. Build for production
npm run build
```

Set your API key in `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

---

## ML Prototype Disclosures & Honesty

- **Interpretable Classifier**: RiffSense utilizes a calibrated multivariate logistic soft classifier with personal baseline z-scores. It is designed specifically for this hackathon prototype.
- **Personalized Baselines**: All metrics compare the user only to their own moving average ($\alpha = 0.15$), preventing unfair comparisons across different typists.
- **No Fabricated Data**: Riff does not claim clinical training on private datasets or medical diagnostic capabilities.
