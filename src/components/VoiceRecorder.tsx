import React from "react";
import { Mic, MicOff, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { LanguageCode } from "../types";

interface VoiceRecorderProps {
  transcript: string;
  setTranscript: (text: string) => void;
  language: LanguageCode;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  transcript,
  setTranscript,
  language,
}) => {
  const {
    isListening,
    error: speechError,
    clearError,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const toggleListen = () => {
    clearError();
    if (isListening) {
      stopListening();
    } else {
      startListening(language, transcript, (text) => {
        setTranscript(text);
      });
    }
  };

  const handleClear = () => {
    setTranscript("");
    clearError();
  };

  const presetPrompts = [
    "Itchy red bumps appeared on my inner wrist 2 days ago.",
    "Dry scaly rash that burns when I apply soap.",
    "Dark pigmented mole on my shoulder that seems slightly larger.",
    "Small fluid-filled blister on my finger.",
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Spoken Description (Voice Input)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tap the microphone and describe your skin concern in your own words.
          </p>
        </div>

        {transcript && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Mic Animation Button */}
      <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 relative overflow-hidden">
        <div className="relative">
          {isListening && (
            <>
              <span className="absolute -inset-4 rounded-full bg-teal-500/20 animate-ping" />
              <span className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-pulse" />
            </>
          )}

          <button
            onClick={toggleListen}
            type="button"
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isListening
                ? "bg-rose-600 text-white shadow-rose-500/40 scale-105"
                : "bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-teal-500/30 hover:scale-105"
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-4 flex items-center gap-1.5">
          {isListening ? (
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Listening... Speak now ({language})
            </span>
          ) : (
            "Tap microphone to start recording"
          )}
        </p>

        {speechError && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}
      </div>

      {/* Live Transcript Textarea */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Editable Spoken Transcript:
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="e.g. Red rash on my elbow that started yesterday after gardening..."
          rows={3}
          className="w-full p-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
        />
      </div>

      {/* Preset Example Quick Pills */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" /> Or pick a sample description:
        </span>
        <div className="flex flex-wrap gap-2">
          {presetPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTranscript(prompt)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 transition text-left"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
