function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "with",
  "you",
  "your",
]);

const GENERIC_WORDS = new Set(["about", "idea", "thing", "stuff", "math", "something", "nice"]);

export function evaluateUnderstanding(answer, lesson) {
  const answerText = normalize(answer);
  const lessonText = normalize(lesson);

  const lessonTokens = lessonText.split(" ").filter(Boolean);
  const answerTokens = answerText.split(" ").filter(Boolean);
  const lessonContentTokens = lessonTokens.filter((token) => !STOP_WORDS.has(token));
  const answerContentTokens = answerTokens.filter((token) => !STOP_WORDS.has(token));

  const overlap = answerContentTokens.filter((token) => lessonContentTokens.includes(token)).length;
  const coverage = lessonContentTokens.length ? overlap / lessonContentTokens.length : 0;
  const detail = answerContentTokens.length ? Math.min(1, answerContentTokens.length / 6) : 0;
  const genericPenalty = answerContentTokens.filter((token) => GENERIC_WORDS.has(token)).length * 0.12;
  const shortAnswerPenalty = answerContentTokens.length < 3 ? 0.3 : 0;
  const gibberishPenalty = answerContentTokens.length === 0 ? 0.45 : 0;

  const confidence = Math.max(
    0,
    Math.min(1, 0.1 + coverage * 0.7 + detail * 0.16 - genericPenalty - shortAnswerPenalty - gibberishPenalty)
  );

  let feedback = "Confidence: low — your summary needs a bit more detail or a clearer main idea.";
  if (confidence >= 0.75) {
    feedback = "Confidence: strong — your summary captures the main idea clearly.";
  } else if (confidence >= 0.5) {
    feedback = "Confidence: fair — your summary is on the right track, but it could include a few more key ideas.";
  }

  return {
    confidence,
    feedback,
    coverage,
  };
}
