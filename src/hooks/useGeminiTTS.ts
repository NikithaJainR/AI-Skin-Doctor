import { useState, useRef, useEffect, useCallback } from "react";
import { AssessmentReport, LanguageCode } from "../types";
import { VoiceOutputManager } from "../utils/speech";

export function base64ToAudioUrl(base64Data: string, mimeType: string): string {
  if (
    mimeType.includes("mp3") ||
    mimeType.includes("wav") ||
    mimeType.includes("mpeg") ||
    mimeType.includes("ogg")
  ) {
    return `data:${mimeType};base64,${base64Data}`;
  }

  try {
    const cleanBase64 = base64Data.replace(/\s+/g, "");
    const binary = atob(cleanBase64);
    const pcmBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      pcmBytes[i] = binary.charCodeAt(i);
    }

    let sampleRate = 24000;
    const match = mimeType.match(/rate=(\d+)/);
    if (match && match[1]) {
      sampleRate = parseInt(match[1], 10);
    }

    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmBytes.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    view.setUint8(0, 0x52);
    view.setUint8(1, 0x49);
    view.setUint8(2, 0x46);
    view.setUint8(3, 0x46);
    view.setUint32(4, 36 + dataSize, true);

    // WAVE
    view.setUint8(8, 0x57);
    view.setUint8(9, 0x41);
    view.setUint8(10, 0x56);
    view.setUint8(11, 0x45);

    // fmt
    view.setUint8(12, 0x66);
    view.setUint8(13, 0x6d);
    view.setUint8(14, 0x74);
    view.setUint8(15, 0x20);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data
    view.setUint8(36, 0x64);
    view.setUint8(37, 0x61);
    view.setUint8(38, 0x74);
    view.setUint8(39, 0x61);
    view.setUint32(40, dataSize, true);

    const wavBytes = new Uint8Array(buffer);
    wavBytes.set(pcmBytes, 44);

    const blob = new Blob([wavBytes], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn("[TTS] PCM to WAV conversion fallback:", err);
    return `data:${mimeType};base64,${base64Data}`;
  }
}

export interface UseGeminiTTSReturn {
  isPreparing: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  spokenText: string;
  isFallbackMode: boolean;
  hasAudioReady: boolean;
  autoplayBlocked: boolean;
  playTTS: (
    report: AssessmentReport | null,
    language: LanguageCode,
    customText?: string
  ) => Promise<void>;
  pauseTTS: () => void;
  resumeTTS: () => void;
  stopTTS: () => void;
}

export function useGeminiTTS(): UseGeminiTTSReturn {
  const [isPreparing, setIsPreparing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [hasAudioReady, setHasAudioReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const fallbackManagerRef = useRef<VoiceOutputManager | null>(null);

  if (!fallbackManagerRef.current && typeof window !== "undefined") {
    fallbackManagerRef.current = new VoiceOutputManager();
  }

  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (fallbackManagerRef.current) {
      fallbackManagerRef.current.stop();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsPreparing(false);
    setAutoplayBlocked(false);
  }, []);

  const pauseTTS = useCallback(() => {
    if (isFallbackMode && fallbackManagerRef.current) {
      fallbackManagerRef.current.pause();
      setIsPaused(true);
      return;
    }
    if (audioRef.current && isPlaying && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, [isFallbackMode, isPlaying, isPaused]);

  const resumeTTS = useCallback(() => {
    if (isFallbackMode && fallbackManagerRef.current) {
      fallbackManagerRef.current.resume();
      setIsPaused(false);
      return;
    }
    if (audioRef.current && isPaused) {
      audioRef.current
        .play()
        .then(() => {
          setIsPaused(false);
          setAutoplayBlocked(false);
          console.log("[TTS] Playback resumed");
        })
        .catch((e) => console.warn("[TTS] Audio resume error:", e));
    }
  }, [isFallbackMode, isPaused]);

  const executeFallback = useCallback(
    (textToSpeak: string, language: LanguageCode) => {
      console.log("[TTS] Gemini TTS failed/unsupported. Triggering SpeechSynthesis fallback.");
      setIsFallbackMode(true);
      setIsPreparing(false);
      setIsPlaying(true);
      setIsPaused(false);
      setHasAudioReady(true);
      setAutoplayBlocked(false);

      if (fallbackManagerRef.current) {
        fallbackManagerRef.current.speak(textToSpeak, language, {
          onEnd: () => {
            console.log("[TTS] Playback ended (SpeechSynthesis)");
            setIsPlaying(false);
            setIsPaused(false);
          },
          onError: () => {
            setIsPlaying(false);
            setIsPaused(false);
          },
        });
      }
    },
    []
  );

  const playTTS = useCallback(
    async (
      report: AssessmentReport | null,
      language: LanguageCode,
      customText?: string
    ) => {
      // If currently paused or has audio loaded, resume or play existing
      if (isPaused && audioRef.current) {
        resumeTTS();
        return;
      }

      if (hasAudioReady && audioRef.current && autoplayBlocked) {
        try {
          await audioRef.current.play();
          setAutoplayBlocked(false);
          setIsPlaying(true);
          setIsPaused(false);
          console.log("[TTS] Playback started via user gesture");
          return;
        } catch (err) {
          console.warn("[TTS] Playback error on user gesture:", err);
        }
      }

      // Stop any current playback
      stopTTS();
      setIsPreparing(true);
      setIsFallbackMode(false);
      setHasAudioReady(false);
      setAutoplayBlocked(false);

      let fallbackText = customText;
      if (!fallbackText && report) {
        fallbackText = `Based on your skin scan, this appears consistent with ${report.possible_condition}. Primary recommendation: ${report.recommended_home_care?.[0] || "Consult a dermatologist"}. Please seek medical evaluation if symptoms worsen.`;
      }
      if (!fallbackText) {
        fallbackText = "Assessment results are ready. Please consult a dermatologist for confirmation.";
      }

      console.log("[TTS] Request started");

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            report,
            text: customText,
            language,
            voiceName: "Kore",
          }),
        });

        console.log("[TTS] Response received:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const rawText = await response.text();
        let data: any = null;
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(`Invalid JSON response: ${rawText.slice(0, 80)}`);
        }

        if (!data || !data.success || !data.audioBase64) {
          throw new Error(data?.error || "No audio payload from TTS API");
        }

        console.log("[TTS] Audio data received");

        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }

        const objectUrl = base64ToAudioUrl(
          data.audioBase64,
          data.mimeType || "audio/pcm;rate=24000"
        );
        audioUrlRef.current = objectUrl;

        console.log("[TTS] Audio decoded");

        const audio = new Audio(objectUrl);
        audioRef.current = audio;

        const textToSet = data.spokenText || fallbackText;
        setSpokenText(textToSet);

        audio.onplay = () => {
          setIsPreparing(false);
          setIsPlaying(true);
          setIsPaused(false);
          setHasAudioReady(true);
          setAutoplayBlocked(false);
          console.log("[TTS] Playback started");
        };

        audio.onpause = () => {
          setIsPaused(true);
        };

        audio.onended = () => {
          console.log("[TTS] Playback ended");
          setIsPlaying(false);
          setIsPaused(false);
          setIsPreparing(false);
        };

        audio.onerror = (e) => {
          console.warn("[TTS] HTMLAudioElement playback error, trying fallback:", e);
          executeFallback(textToSet, language);
        };

        try {
          await audio.play();
        } catch (playErr: any) {
          console.warn("[TTS] Autoplay or play exception:", playErr);
          setIsPreparing(false);
          setHasAudioReady(true);

          if (playErr.name === "NotAllowedError") {
            setAutoplayBlocked(true);
            setIsPlaying(false);
            setIsPaused(false);
          } else {
            executeFallback(textToSet, language);
          }
        }
      } catch (err) {
        console.warn("[TTS] Gemini TTS API failed, seamless fallback:", err);
        executeFallback(fallbackText, language);
      }
    },
    [isPaused, hasAudioReady, autoplayBlocked, resumeTTS, stopTTS, executeFallback]
  );

  useEffect(() => {
    return () => {
      stopTTS();
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [stopTTS]);

  return {
    isPreparing,
    isPlaying,
    isPaused,
    spokenText,
    isFallbackMode,
    hasAudioReady,
    autoplayBlocked,
    playTTS,
    pauseTTS,
    resumeTTS,
    stopTTS,
  };
}

