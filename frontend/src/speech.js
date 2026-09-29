// speech.js
// Read-aloud built on the browser's native SpeechSynthesis API.
// Supports boundary events for synchronized word/sentence highlighting in Neuro-Read mode.

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text, onEnd, onBoundary) {
  if (!isSpeechSupported() || !text) return;
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  if (onBoundary) {
    utterance.onboundary = (event) => {
      onBoundary({
        charIndex: event.charIndex,
        charLength: event.charLength || 6,
        name: event.name,
      });
    };
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
