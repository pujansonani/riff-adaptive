// speechRecognition.js
// Multimodal Voice Input using browser SpeechRecognition / webkitSpeechRecognition.

const LANG_CODE_MAP = {
  English: "en-US",
  Hindi: "hi-IN",
  Spanish: "es-ES",
  French: "fr-FR",
  Mandarin: "zh-CN",
  Arabic: "ar-SA",
  Tamil: "ta-IN",
  Marathi: "mr-IN",
};

let activeRecognition = null;

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startListening({
  onTranscript,
  onError,
  onEnd,
  language = "English",
  continuous = false,
}) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError(new Error("Speech recognition is not supported in this browser."));
    return null;
  }

  // Stop any active recognition before starting new one
  stopListening();

  try {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = LANG_CODE_MAP[language] || language || "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (onTranscript) {
        onTranscript({
          finalTranscript: finalTranscript.trim(),
          interimTranscript: interimTranscript.trim(),
          text: (finalTranscript + " " + interimTranscript).trim(),
        });
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (onError) onError(event);
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    recognition.start();
    activeRecognition = recognition;
    return recognition;
  } catch (err) {
    console.error("Failed to start speech recognition", err);
    if (onError) onError(err);
    return null;
  }
}

export function stopListening() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
}
