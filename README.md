# Riff: Adaptive Neuro-Learning Engine

**Learns what you love. Teaches how you learn.**

Riff is an intelligent K-12 learning engine that continuously adapts **how** it teaches based on how a student interacts. It compares every signal strictly against the learner's **own personal baseline** (never against other students) and dynamically routes through multimodal explanations, micro-steps, concept diagrams, reverse tutoring, and spaced retrieval.

---

## The Adaptive Neuro-Learning Loop

```
  ┌────────────────────────────────────────────────────────┐
  │                        OBSERVE                         │
  │   Typing cadence, pause durations, backspace ratio,   │
  │   modality affinity & spaced repetition queue          │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                         DETECT                         │
  │   RiffSense ML behavior model estimates state:        │
  │   focused · uncertain · struggling · disengaging       │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                         ADAPT                          │
  │   RiffAdapt selects best intervention: micro-steps,    │
  │   visual whiteboard, concept bridge, or audio support  │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                         TEACH                          │
  │   Multimodal delivery: text, audio speech, diagrams,   │
  │   accessible Neuro-Read typography, and analogies      │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                        PRACTICE                        │
  │   Scratchpad with live waveform, RiffBoard drawing,    │
  │   Teach It Back reverse tutoring, Debug My Thinking    │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                        REMEMBER                        │
  │   Memory Engine with flashcards and spaced repetition  │
  │   (5m → 1d → 3d → 7d → 14d) active recall queue        │
  └────────────────────────────────────────────────────────┘
```

> **Important Non-Clinical Commitment**:
> Riff is an educational interaction tool, **not** a medical or diagnostic system. Riff never claims to diagnose ADHD, dyslexia, or autism. It uses supportive phrasing such as *"Riff noticed you may be getting stuck. Let's try another way."* and *"Riff is learning what works best for you."*

---

## Core Subsystems

### 1. RiffSense — ML-Based Behavior Intelligence
- **Personal Baseline**: Accumulates exponential moving averages and standard deviations of the learner's own keystroke intervals and pause durations in `riff_behavior_baseline_v1`.
- **Lightweight ML Classifier**: Multivariate soft classifier (`frictionModel.js`) estimating state probabilities (`focused`, `uncertain`, `struggling`, `disengaging`) from z-score pacing, backspace ratio, cadence shifts, and idle durations.
- **Graceful Fallback**: Contains the proven rule-based heuristic detector as a fallback.

### 2. Riffocus — Adaptive Focus Support Mode
- De-clutters the learning interface into **one micro-step at a time**.
- Provides single-instruction focus, goal progress indicator, gentle prompts, and quick alternative modality links.

### 3. Memory & Retention Engine
- **Spaced Repetition Schedule**: SuperMemo Leitner-inspired intervals: `5 minutes → 1 day → 3 days → 7 days → 14 days`.
- **Interactive 3D Flashcards**: Flip cards with front/back, concept tags, contextual interest hints, and self-assessment buttons.
- **Active Quick Recall**: Immediate retrieval challenges stored locally in `riff_recall_v1`.

### 4. Multimodal Learning (Voice Input & Audio)
- **Voice Input**: Speech-to-text via browser `SpeechRecognition` / `webkitSpeechRecognition` with active recording microphone indicators.
- **Read Aloud**: Zero-dependency offline audio speech via `SpeechSynthesis` with word/sentence boundary highlighting.

### 5. RiffBoard — Interactive Whiteboard
- Pure HTML5 Canvas whiteboard (`Whiteboard.jsx`) with freehand pen, arrows, lines, rectangles, circles, text labels, and eraser.
- **"Visualize Concept"**: Auto-lays out structured node-and-arrow visual concept diagrams on the canvas (`POST /api/visualize`).
- **"Ask Riff about this"**: Synthesizes diagram text and drawing metadata into AI tutoring feedback.

### 6. Neuro-Read — Accessible Reading Mode
- **Customizable Typography**: Font size (Standard, Large, XL), line spacing (Standard, Relaxed, Spacious), letter spacing (Wide, Extra-wide).
- **Readable Fonts**: Standard Inter, Accessible Sans (Lexend), Fraunces Serif, JetBrains Mono.
- **Contrast Themes**: Default, Warm Paper, Midnight High Contrast, Soft Mint, Solar Amber.
- **Focus Tools**: Reading Ruler overlay and Bionic text emphasis.

### 7. RiffAdapt — The Decision Engine
- Central brain (`adaptationEngine.js`) integrating live behavior state, comprehension confidence, memory queue, and learner modality profiles to choose the next best pedagogical strategy.

### 8. Learner Modality Profile
- Contextual multi-armed bandit (`modalityProfile.js`) tracking relative affinity across 8 modalities: `visual`, `text`, `audio`, `analogy`, `micro-step`, `interactive`, `teach-back`, and `retrieval`.

---

## Preserved Riff Features

All classic Riff capabilities remain fully operational:
- **Riff It**: Interest-based lesson remixing.
- **Vibe Theming**: Automated classification (12 categories) with accent colors and SVG mascot expressions.
- **Debug My Thinking**: Specific misconception detection and pinpoint repair.
- **Bridge It**: 3-step analogy chain (Everyday → Interest → Academic Concept).
- **Teach It Back**: Reverse tutoring roleplay with in-world characters.
- **Understanding Checks**: Heuristic lexical and semantic comprehension evaluation.
- **Multi-language Translation**: Hindi, Spanish, French, Mandarin, Arabic, Tamil, Marathi.

---

## API Endpoints

| Endpoint | Method | Purpose | Safe Fallback |
|---|---|---|---|
| `/api/remix` | `POST` | Rewrites lesson around learner's interest | Deterministic template remix |
| `/api/steps` | `POST` | Generates 3-5 numbered micro-steps | Deterministic step breakdown |
| `/api/hint` | `POST` | AI hint tailored to behavior & interest | Rule-based behavior hint |
| `/api/simpler` | `POST` | Simpler K-12 explanation | Local concise summary |
| `/api/quiz` | `POST` | 3 practice quiz questions | Topic-based questions |
| `/api/diagnose` | `POST` | Names misconception + targeted fix | Structured concept review |
| `/api/bridge` | `POST` | 3-step concept bridge chain | 3-step analogy chain |
| `/api/teachback` | `POST` | Reverse tutoring character reaction | Socratic probe question |
| `/api/translate` | `POST` | Translates lesson into target language | Local text preserve |
| `/api/flashcards` | `POST` | Structured Q&A cards for spaced review | Deterministic sentence cards |
| `/api/visualize` | `POST` | Structured diagram nodes & arrows | 3-stage visual canvas layout |
| `/api/recall` | `POST` | Active retrieval practice items | Lesson retrieval questions |
| `/api/vibe` | `POST` | Interest category classification | Keyword regex matcher |
| `/api/health` | `GET` | Health check | Returns `{ ok: true }` |

---

## LocalStorage Namespaces

- `riff_behavior_baseline_v1`: Personal typing speed and pause variance statistics.
- `riff_learning_profile_v1`: Multi-armed modality affinity scores.
- `riff_recall_v1`: Flashcards, spaced repetition levels, and review history.
- `riff_bandit_v1`: Interest category bandit state.

---

## Setup & Running

```bash
# 1. Install dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# 2. Run backend and frontend concurrently
npm run dev

# 3. Run unit test suite
npm test

# 4. Production build
npm run build
```

Set your API key in `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

---

## ML Model Documentation & Limitations

- **Prototype Classifier**: The current RiffSense behavior model uses an interpretable, calibrated multivariate logistic scoring function with personal baseline z-scores. It is designed for prototype and hackathon demonstration.
- **No Fabricated Training Claims**: Riff was not trained on private clinical datasets. Interaction weights are calibrated based on cognitive friction heuristics (typing pacing shifts, backspace burst frequencies, pause durations).
- **Personalized Baselines**: All scoring measures deviation against the individual user's own session history, ensuring fair adaptation across different typing speeds.
