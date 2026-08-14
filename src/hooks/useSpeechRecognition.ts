import { useState, useRef, useEffect, useCallback } from "react";
import { LanguageCode } from "../types";
import { LANG_TAG_MAP, mapSpeechError } from "../utils/speech";

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  clearError: () => void;
  startListening: (
    lang: LanguageCode,
    initialText: string,
    onResult: (text: string) => void
  ) => void;
  stopListening: () => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeCallbackRef = useRef<((text: string) => void) | null>(null);
  const isListeningRef = useRef(false);

  // Check Web Speech API availability
  const isSupported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const startListening = useCallback(
    (lang: LanguageCode, initialText: string, onResult: (text: string) => void) => {
      setError(null);

      if (!isSupported) {
        setError("Voice input is not supported by this browser. Please use Google Chrome or Microsoft Edge, or type your concern.");
        return;
      }

      // Stop any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = LANG_TAG_MAP[lang] || "en-IN";

      recognitionRef.current = recognition;
      activeCallbackRef.current = onResult;

      const baseText = initialText ? initialText.trim() : "";
      let sessionFinalText = "";

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
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

        if (activeCallbackRef.current) {
          activeCallbackRef.current(combinedText);
        }
      };

      recognition.onerror = (event: any) => {
        const errCode = event.error;
        console.warn("[WebSpeechAPI] Error:", errCode);
        if (errCode !== "aborted") {
          setError(mapSpeechError(errCode));
        }
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch (err: any) {
        console.error("Failed to start SpeechRecognition:", err);
        setError("Unable to access microphone. Please allow microphone permissions in browser settings.");
        isListeningRef.current = false;
        setIsListening(false);
      }
    },
    [isSupported]
  );

  return {
    isListening,
    isSupported,
    error,
    clearError,
    startListening,
    stopListening,
  };
};
