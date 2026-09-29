import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
  console.warn("⚠️  GROQ_API_KEY is not set. Add it to backend/.env");
}

function buildRemixPrompt(lesson, interest) {
  return `You are Riff, an educational content transformer for K-12 students. Rewrite the following lesson by reframing it entirely around the student's stated interest, using that interest as the central metaphor and context throughout. Keep the academic concept itself completely accurate — only the framing, examples, and language should change. Write for a school-age reader, 3-5 sentences, warm and clear, no headers or preamble. Return ONLY the rewritten passage, nothing else.

Student's interest: ${interest}

Original lesson:
${lesson}`;
}

function buildStepPrompt(content, interest) {
  return `Rewrite the following content as a short numbered list of 3-5 simple, concrete micro-steps a K-12 student could follow one at a time. If it fits naturally, keep flavor from this interest: ${
    interest || "none specified"
  }. Prioritize clarity above all. Return ONLY the numbered list, nothing else, no preamble.

Content:
${content}`;
}

function buildBehaviorHint(content, interest, behavior) {
  const source = (content || "").toLowerCase();
  const label = (interest || "").trim();
  const backspaceRatio = Number(behavior?.backspaceRatio || 0);
  const deviationPct = Number(behavior?.deviationPct || 0);

  let hint = "Try one tiny step first and write that down.";

  if (/fraction|numerator|denominator|equation|solve|calculate|add|subtract|multiply|divide/.test(source)) {
    hint = "Start by naming what you already know and what you are trying to find.";
  } else if (/essay|paragraph|story|sentence|write|argument/.test(source)) {
    hint = "Begin with one strong sentence about your main idea.";
  } else if (/cell|planet|atom|energy|experiment|ecosystem|science/.test(source)) {
    hint = "Pick one real-world example and connect it to the idea.";
  }

  if (backspaceRatio > 0.2 || deviationPct > 30) {
    hint = `You seem stuck, so ${hint.toLowerCase()}`;
  }

  if (label) {
    hint += ` Since you like ${label}, use that as your example.`;
  }

  return hint;
}

function buildHintPrompt(content, interest, behavior) {
  return `You are helping a K-12 learner who seems stuck. Give a single short supportive hint that nudges them forward without giving the full answer. Keep it warm, clear, and concrete. Mention their interest naturally if it helps. Use the behavior context below to tailor the hint.

Student interest: ${interest || "none specified"}

Behavior context: ${behavior}

Content:
${content}

Return ONLY the hint, nothing else.`;
}

function buildSimplerPrompt(content, interest) {
  return `Rewrite the following explanation in a much simpler way for a K-12 learner. Keep the core meaning accurate, use short sentences, and naturally include the student's interest if it helps: ${interest || "none specified"}. Return ONLY the simpler explanation, nothing else.

Content:
${content}`;
}

function buildQuizPrompt(content, interest) {
  return `Create 3 short quiz questions about the following content for a K-12 learner. Make them simple, clear, and engaging. Include the student's interest naturally if it helps: ${interest || "none specified"}. Return ONLY a numbered list of 3 questions, nothing else.

Content:
${content}`;
}

function buildPlanPrompt(content, interest) {
  return `Create a short 3-step study plan for a K-12 learner based on the following content. Make the plan encouraging and practical. Include the student's interest naturally if it helps: ${interest || "none specified"}. Return ONLY a numbered list of 3 steps, nothing else.

Content:
${content}`;
}

// ---- Vibe classification: turns an interest into a theme category. ----
// Always has a working local fallback so theming never breaks without an API key.
const VIBE_CATEGORIES = [
  "space", "sports", "gaming", "nature", "magic",
  "music", "ocean", "food", "vehicles", "mystery", "art", "everyday",
];

const VIBE_KEYWORDS = {
  space: /space|astronaut|planet|galaxy|rocket|star wars|nasa|alien|moon/,
  sports: /soccer|football|basketball|cricket|baseball|tennis|sport|athlete|olympic/,
  gaming: /minecraft|roblox|fortnite|video game|gaming|gamer|pokemon|zelda|mario/,
  nature: /animal|dinosaur|\bdog\b|\bcat\b|forest|garden|plant|wildlife|\bbug\b|insect/,
  magic: /magic|wizard|harry potter|dragon|fantasy|fairy|spell/,
  music: /music|\bsong\b|guitar|piano|singer|band|rap|k-pop|drum/,
  ocean: /ocean|shark|\bfish\b|\bsea\b|whale|mermaid|pirate|\bship\b/,
  food: /food|cooking|baking|pizza|dessert|\bchef\b|recipe/,
  vehicles: /\bcar\b|truck|train|plane|race car|f1\b/,
  mystery: /mystery|detective|\bspy\b|crime|puzzle/,
  art: /\bart\b|drawing|paint|anime|comic|craft/,
};

function classifyInterestLocally(interest) {
  const text = (interest || "").toLowerCase();
  for (const category of VIBE_CATEGORIES) {
    const pattern = VIBE_KEYWORDS[category];
    if (pattern && pattern.test(text)) return category;
  }
  return "everyday";
}

function buildVibePrompt(interest) {
  return `Classify this student's stated interest into exactly ONE of these categories: ${VIBE_CATEGORIES.join(
    ", "
  )}. Reply with ONLY the single lowercase category word, nothing else.

Interest: ${interest}`;
}

// ---- Debug My Thinking: names the specific misconception behind an answer, not just "wrong". ----
function buildDiagnosePrompt(answer, lesson, interest) {
  return `You are Riff, tutoring a K-12 student. The student was given a lesson, then tried to answer or explain it in their own words below. Look only at their answer and identify the single most likely specific misconception or gap behind it — not just "the answer is wrong," the actual misunderstanding. Then write one short, concrete fix for exactly that misconception, using the student's stated interest as the example if it naturally helps.

Lesson:
${lesson}

Student interest: ${interest || "none specified"}

Student's answer:
${answer}

Respond in EXACTLY this format, nothing else:
MISCONCEPTION: <5-8 word plain-language name for the specific gap>
FIX: <2-3 short, warm sentences that repair exactly that gap>`;
}

function parseDiagnose(raw) {
  const misMatch = raw.match(/MISCONCEPTION:\s*(.+)/i);
  const fixMatch = raw.match(/FIX:\s*([\s\S]+)/i);
  return {
    misconception: misMatch ? misMatch[1].trim() : "Not enough detail yet to pinpoint one gap",
    fix: fixMatch
      ? fixMatch[1].trim()
      : "Try re-explaining the idea in one full sentence, starting with 'This works because...'",
  };
}

// ---- Bridge It: a 3-step analogy chain from something familiar, through the interest, to the real idea. ----
function buildBridgePrompt(content, interest) {
  return `You are Riff. Build a 3-step "concept bridge" for a K-12 student that connects something almost every kid already understands, to their personal interest, to the real academic idea below. Each step must be exactly one short sentence.

Student interest: ${interest || "something everyday"}

Academic content:
${content}

Respond in EXACTLY this format, nothing else:
STEP1: <something almost every kid already understands, unrelated to school>
STEP2: <how that connects to the student's interest>
STEP3: <how that finally connects to and explains the real academic idea>`;
}

function parseBridge(raw) {
  const steps = [1, 2, 3]
    .map((n) => {
      const match = raw.match(new RegExp(`STEP${n}:\\s*(.+)`, "i"));
      return match ? match[1].trim() : "";
    })
    .filter(Boolean);
  return { steps };
}

// ---- Teach It Back: reverse tutoring. The student explains it to an in-world character. ----
// Deliberately stateless and capped to one reaction + one question per call — no open-ended chat.
function buildTeachbackPrompt(explanation, lesson, interest) {
  const character = interest
    ? `a friendly, curious character from the world of ${interest}`
    : "a friendly, curious character";
  return `You are roleplaying, strictly for K-12 tutoring purposes, as ${character}. A student just tried to teach you an academic idea in their own words. Your only job: react in ONE short in-character sentence to whether their explanation makes sense, then ask exactly ONE short follow-up question that gently probes the weakest or vaguest part of their explanation (or, if it was excellent, a question that extends their thinking). Stay strictly on this academic topic. Never ask for personal information. Never discuss anything outside the lesson. Two sentences total, maximum.

The real lesson, for your own reference only — do not repeat it verbatim:
${lesson}

Student's explanation to you:
${explanation}

Respond in EXACTLY this format, nothing else:
REACTION: <one short in-character sentence>
QUESTION: <one short follow-up question>`;
}

function parseTeachback(raw) {
  const reactionMatch = raw.match(/REACTION:\s*(.+)/i);
  const questionMatch = raw.match(/QUESTION:\s*(.+)/i);
  return {
    reaction: reactionMatch ? reactionMatch[1].trim() : "Hmm, tell me a bit more!",
    question: questionMatch
      ? questionMatch[1].trim()
      : "What part would you explain differently if you tried again?",
  };
}

// ---- Translate: turns any already-generated Riff output into another language on demand. ----
function buildTranslatePrompt(content, targetLanguage) {
  return `Translate the following text into ${targetLanguage}, keeping the meaning, warmth, and reading level exactly the same for a K-12 student. Return ONLY the translated text, nothing else.

Text:
${content}`;
}

async function callGroq(prompt) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || "Couldn't generate a response — try again.";
}

app.post("/api/remix", async (req, res) => {
  try {
    const { lesson, interest } = req.body;
    if (!lesson || !interest) {
      return res.status(400).json({ error: "lesson and interest are required" });
    }
    const remix = await callGroq(buildRemixPrompt(lesson, interest));
    res.json({ remix });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate remix" });
  }
});

app.post("/api/steps", async (req, res) => {
  try {
    const { content, interest } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    const steps = await callGroq(buildStepPrompt(content, interest));
    res.json({ steps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate steps" });
  }
});

app.post("/api/hint", async (req, res) => {
  try {
    const { content, interest, behavior } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const fallbackHint = buildBehaviorHint(content, interest, behavior);

    try {
      if (GROQ_API_KEY) {
        const aiHint = await callGroq(buildHintPrompt(content, interest, behavior));
        if (aiHint && aiHint.trim()) {
          return res.json({ hint: aiHint });
        }
      }
    } catch (err) {
      console.warn("Groq hint refinement failed, using rule-based hint", err);
    }

    res.json({ hint: fallbackHint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate hint" });
  }
});

app.post("/api/simpler", async (req, res) => {
  try {
    const { content, interest } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    const simpler = await callGroq(buildSimplerPrompt(content, interest));
    res.json({ simpler });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate simpler explanation" });
  }
});

app.post("/api/quiz", async (req, res) => {
  try {
    const { content, interest } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    const quiz = await callGroq(buildQuizPrompt(content, interest));
    res.json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

app.post("/api/plan", async (req, res) => {
  try {
    const { content, interest } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    const plan = await callGroq(buildPlanPrompt(content, interest));
    res.json({ plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate study plan" });
  }
});

app.post("/api/vibe", async (req, res) => {
  try {
    const { interest } = req.body;
    const fallback = classifyInterestLocally(interest);
    if (!GROQ_API_KEY) return res.json({ vibe: fallback });

    try {
      const raw = await callGroq(buildVibePrompt(interest));
      const cleaned = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
      res.json({ vibe: VIBE_CATEGORIES.includes(cleaned) ? cleaned : fallback });
    } catch (err) {
      console.warn("Groq vibe classification failed, using local fallback", err);
      res.json({ vibe: fallback });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to classify vibe" });
  }
});

app.post("/api/diagnose", async (req, res) => {
  try {
    const { answer, lesson, interest } = req.body;
    if (!answer || !lesson) {
      return res.status(400).json({ error: "answer and lesson are required" });
    }
    if (!GROQ_API_KEY) {
      return res.json({
        misconception: "Can't diagnose without an AI key set",
        fix: "Add GROQ_API_KEY to backend/.env to unlock misconception detection.",
      });
    }
    const raw = await callGroq(buildDiagnosePrompt(answer, lesson, interest));
    res.json(parseDiagnose(raw));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to diagnose answer" });
  }
});

app.post("/api/bridge", async (req, res) => {
  try {
    const { content, interest } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    if (!GROQ_API_KEY) {
      return res.json({ steps: ["Add GROQ_API_KEY to backend/.env to unlock concept bridges."] });
    }
    const raw = await callGroq(buildBridgePrompt(content, interest));
    res.json(parseBridge(raw));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build bridge" });
  }
});

app.post("/api/teachback", async (req, res) => {
  try {
    const { explanation, lesson, interest } = req.body;
    if (!explanation || !lesson) {
      return res.status(400).json({ error: "explanation and lesson are required" });
    }
    if (!GROQ_API_KEY) {
      return res.json({
        reaction: "I'd love to hear this!",
        question: "Add GROQ_API_KEY to backend/.env so I can really respond.",
      });
    }
    const raw = await callGroq(buildTeachbackPrompt(explanation, lesson, interest));
    res.json(parseTeachback(raw));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate teachback response" });
  }
});

app.post("/api/translate", async (req, res) => {
  try {
    const { content, targetLanguage } = req.body;
    if (!content || !targetLanguage) {
      return res.status(400).json({ error: "content and targetLanguage are required" });
    }
    if (!GROQ_API_KEY) {
      return res.status(503).json({ error: "Add GROQ_API_KEY to backend/.env to unlock translation." });
    }
    const translated = await callGroq(buildTranslatePrompt(content, targetLanguage));
    res.json({ translated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to translate" });
  }
});

// ---- Flashcards: Generates structured Q&A cards for spaced repetition ----
function buildFlashcardsPrompt(lesson, interest) {
  return `You are Riff. Create 3 structured flashcards for a K-12 learner based on the lesson below, incorporating their interest (${interest || "general"}) into the examples and hints where helpful.
Lesson:
${lesson}

Return ONLY a valid JSON array of 3 objects with keys "concept", "front", "back", "hint". No markdown formatting or extra text.
Example format:
[
  {"concept": "Numerator", "front": "What does the top number in a fraction represent?", "back": "The number of parts you currently have.", "hint": "Think of slices of pizza you took."}
]`;
}

function parseFlashcards(raw, lesson, interest) {
  try {
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c, i) => ({
        id: `card-${Date.now()}-${i + 1}`,
        concept: c.concept || `Key Concept ${i + 1}`,
        front: c.front || "Review question",
        back: c.back || "Answer",
        hint: c.hint || (interest ? `Remember ${interest}!` : ""),
      }));
    }
  } catch {
    // fallback below
  }
  return fallbackFlashcards(lesson, interest);
}

function fallbackFlashcards(lesson, interest) {
  const clean = (lesson || "").trim();
  const sentences = clean.split(/(?<=[.?!])\s+/).filter((s) => s.length > 15);
  const label = interest || "your favorite examples";

  if (sentences.length === 0) {
    return [
      {
        id: `card-${Date.now()}-1`,
        concept: "Core Concept",
        front: "What is the key idea of this lesson?",
        back: clean || "A fundamental building block of this topic.",
        hint: `Connect it to ${label}.`,
      },
    ];
  }

  return sentences.slice(0, 3).map((sent, i) => ({
    id: `card-${Date.now()}-${i + 1}`,
    concept: `Key Concept #${i + 1}`,
    front: i === 0 ? "What is the primary definition here?" : i === 1 ? "How does this principle operate?" : "What is an important takeaway?",
    back: sent,
    hint: `Think about how this applies in ${label}.`,
  }));
}

// ---- Visualize: Generates structured diagram nodes & arrows for RiffBoard ----
function buildVisualizePrompt(content, interest) {
  return `You are Riff. Generate a simple 3-stage visual diagram layout for this concept:
"${content}"
Interest context: ${interest || "none"}

Return ONLY a valid JSON array of diagram elements for a canvas of width 800 and height 400.
Include 3 "node" elements and 2 "arrow" elements connecting them in sequence from left to right.
Example format:
[
  {"type": "node", "text": "Sunlight (Energy)", "x": 50, "y": 160, "width": 180, "height": 70, "color": "#ff6b4a"},
  {"type": "arrow", "fromX": 230, "fromY": 195, "toX": 310, "toY": 195, "label": "absorbed by"},
  {"type": "node", "text": "Chlorophyll (Plant)", "x": 310, "y": 160, "width": 180, "height": 70, "color": "#2d6e5e"},
  {"type": "arrow", "fromX": 490, "fromY": 195, "toX": 570, "toY": 195, "label": "creates"},
  {"type": "node", "text": "Glucose (Sugar)", "x": 570, "y": 160, "width": 180, "height": 70, "color": "#3b82f6"}
]`;
}

function parseVisualize(raw, content, interest) {
  try {
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback
  }
  return fallbackVisualize(content, interest);
}

function fallbackVisualize(content, interest) {
  const words = (content || "Input Process Output").split(" ").filter((w) => w.length > 3);
  const first = words[0] || "Concept Start";
  const second = words[Math.floor(words.length / 2)] || (interest || "Transform");
  const third = words[words.length - 1] || "Outcome";

  return [
    { type: "node", text: first, x: 60, y: 160, width: 180, height: 70, color: "#2d6e5e" },
    { type: "arrow", fromX: 240, fromY: 195, toX: 320, toY: 195, label: "leads to" },
    { type: "node", text: second, x: 320, y: 160, width: 180, height: 70, color: "#ff6b4a" },
    { type: "arrow", fromX: 500, fromY: 195, toX: 580, toY: 195, label: "results in" },
    { type: "node", text: third, x: 580, y: 160, width: 180, height: 70, color: "#3b82f6" },
  ];
}

app.post("/api/flashcards", async (req, res) => {
  try {
    const { lesson, interest } = req.body;
    if (!lesson) {
      return res.status(400).json({ error: "lesson is required" });
    }
    if (!GROQ_API_KEY) {
      return res.json({ flashcards: fallbackFlashcards(lesson, interest) });
    }
    try {
      const raw = await callGroq(buildFlashcardsPrompt(lesson, interest));
      res.json({ flashcards: parseFlashcards(raw, lesson, interest) });
    } catch (err) {
      console.warn("Groq flashcard generation failed, using fallback", err);
      res.json({ flashcards: fallbackFlashcards(lesson, interest) });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate flashcards" });
  }
});

app.post("/api/visualize", async (req, res) => {
  try {
    const { content, interest } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    if (!GROQ_API_KEY) {
      return res.json({ elements: fallbackVisualize(content, interest) });
    }
    try {
      const raw = await callGroq(buildVisualizePrompt(content, interest));
      res.json({ elements: parseVisualize(raw, content, interest) });
    } catch (err) {
      console.warn("Groq visualize failed, using fallback", err);
      res.json({ elements: fallbackVisualize(content, interest) });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate visualization" });
  }
});

app.post("/api/recall", async (req, res) => {
  try {
    const { content, interest } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }
    const cards = fallbackFlashcards(content, interest);
    res.json({ questions: cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate recall" });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

// NOTE: the frontend's default API_BASE (see frontend/src/App.jsx) is
// http://localhost:3010 when VITE_API_URL isn't set, so that's the default here too.
const DEFAULT_PORT = Number(process.env.PORT) || 3010;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Riff backend running on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < DEFAULT_PORT + 9) {
      console.warn(`Port ${port} is busy. Trying ${port + 1} instead...`);
      server.close(() => startServer(port + 1));
    } else {
      throw error;
    }
  });
}

startServer(DEFAULT_PORT);