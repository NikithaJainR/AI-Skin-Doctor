import { LanguageCode } from "../types";

// Map Language names to SpeechRecognition / SpeechSynthesis BCP-47 language tags
export const LANG_TAG_MAP: Record<LanguageCode, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Kannada: "kn-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Malayalam: "ml-IN",
  Marathi: "mr-IN",
};

// Map SpeechRecognition error codes to friendly diagnostic messages
export function mapSpeechError(errorCode: string): string {
  switch (errorCode) {
    case "not-allowed":
      return "Microphone permission was denied. Please allow microphone access in your browser settings and try again.";
    case "audio-capture":
      return "No microphone was detected. Please check your microphone.";
    case "network":
      return "Speech recognition requires an internet connection in this browser.";
    case "no-speech":
      return "No speech detected. Please try again.";
    case "aborted":
      return "Voice input was stopped.";
    case "service-not-allowed":
      return "Speech recognition is not available in this browser.";
    default:
      return "Unable to start voice recognition. Please try again.";
  }
}

// --- SPEECH RECOGNITION (VOICE INPUT) ---

export interface VoiceRecognitionHandlers {
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export class VoiceInputManager {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start(lang: LanguageCode, handlers: VoiceRecognitionHandlers, initialText = "") {
    if (!this.recognition) {
      handlers.onError("Voice input is not supported by this browser. Please use Google Chrome or Microsoft Edge, or type your concern.");
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.lang = LANG_TAG_MAP[lang] || "en-IN";

    let sessionFinalText = "";
    const baseText = initialText.trim();

    this.recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinalText += (sessionFinalText ? " " : "") + transcript.trim();
        } else {
          interimTranscript += transcript;
        }
      }

      const sessionText = (sessionFinalText + " " + interimTranscript).trim();
      const combinedText = baseText
        ? (baseText + (sessionText ? " " + sessionText : "")).trim()
        : sessionText;

      handlers.onResult(combinedText, false);
    };

    this.recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error !== "aborted") {
        handlers.onError(mapSpeechError(event.error));
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e: any) {
      handlers.onError("Unable to access microphone. Please check permissions.");
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }
}

// --- SPEECH SYNTHESIS (VOICE OUTPUT) ---

export class VoiceOutputManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return !!this.synth;
  }

  public speak(
    text: string,
    lang: LanguageCode,
    options?: { rate?: number; pitch?: number; onEnd?: () => void; onError?: () => void }
  ) {
    if (!this.synth) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_TAG_MAP[lang] || "en-US";
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;

    // Try to find matching voice
    const voices = this.synth.getVoices();
    const targetLang = LANG_TAG_MAP[lang] || "en-US";
    const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error", e);
      this.currentUtterance = null;
      options?.onError?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }

  public isPaused(): boolean {
    return !!this.synth && this.synth.paused;
  }
}
