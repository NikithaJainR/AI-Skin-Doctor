import React, { useEffect } from "react";
import { Volume2, Play, Pause, Square, Sparkles, RefreshCw } from "lucide-react";
import { AssessmentReport, LanguageCode } from "../types";
import { useGeminiTTS } from "../hooks/useGeminiTTS";

interface AIVoiceSummaryPlayerProps {
  report: AssessmentReport | null;
  language: LanguageCode;
  autoPlay?: boolean;
  compact?: boolean;
}

export const AIVoiceSummaryPlayer: React.FC<AIVoiceSummaryPlayerProps> = ({
  report,
  language,
  autoPlay = false,
  compact = false,
}) => {
  const {
    isPreparing,
    isPlaying,
    isPaused,
    spokenText,
    isFallbackMode,
    autoplayBlocked,
    playTTS,
    pauseTTS,
    resumeTTS,
    stopTTS,
  } = useGeminiTTS();

  useEffect(() => {
    if (report && autoPlay) {
      playTTS(report, language);
    }
  }, [report, autoPlay, language]);

  if (!report) return null;

  const handlePlayClick = () => {
    if (isPlaying && !isPaused) {
      pauseTTS();
    } else if (isPaused) {
      resumeTTS();
    } else {
      playTTS(report, language);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isPlaying || isPreparing
          ? "bg-slate-900 text-white border-teal-500/50 shadow-md"
          : "bg-teal-50/80 dark:bg-slate-900/90 text-slate-900 dark:text-white border-teal-200 dark:border-teal-900/60"
      } ${compact ? "p-2.5 space-y-1.5" : "p-4 space-y-2.5"}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
              isPlaying || isPreparing
                ? "bg-teal-500 text-slate-950 animate-pulse"
                : "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950"
            }`}
          >
            <Volume2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-tight flex items-center gap-1">
                🔊 AI Voice Summary
              </span>
              {isFallbackMode ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Standard Voice
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                  Natural AI Voice
                </span>
              )}
            </div>

            {/* Status text */}
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {isPreparing ? (
                <span className="text-teal-600 dark:text-teal-400 font-semibold animate-pulse">
                  Preparing your voice assessment...
                </span>
              ) : isPlaying && !isPaused ? (
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                  AI Dermatologist is speaking...
                </span>
              ) : autoplayBlocked ? (
                <span className="text-amber-500 font-bold">
                  Tap Play to hear your AI dermatologist
                </span>
              ) : isPaused ? (
                <span className="text-amber-500 font-medium">Paused</span>
              ) : (
                <span>Spoken summary in {language}</span>
              )}
            </div>
          </div>
        </div>

        {/* Animated Waveform when preparing or playing */}
        {(isPreparing || (isPlaying && !isPaused)) && (
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <span className="w-0.5 h-3 bg-teal-400 rounded-full animate-[bounce_0.8s_infinite_100ms]" />
            <span className="w-0.5 h-4 bg-teal-300 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
            <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite_300ms]" />
            <span className="w-0.5 h-5 bg-teal-400 rounded-full animate-[bounce_0.8s_infinite_150ms]" />
            <span className="w-0.5 h-3 bg-teal-300 rounded-full animate-[bounce_0.8s_infinite_250ms]" />
          </div>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {/* Play / Pause Button */}
          <button
            type="button"
            disabled={isPreparing}
            onClick={handlePlayClick}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs ${
              isPreparing
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : isPlaying && !isPaused
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                : autoplayBlocked
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-bounce"
                : "bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950"
            }`}
          >
            {isPreparing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Preparing...</span>
              </>
            ) : isPlaying && !isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : autoplayBlocked ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>▶ Hear Assessment</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPaused ? "Resume" : "Play Voice"}</span>
              </>
            )}
          </button>

          {/* Stop Button */}
          {(isPlaying || isPaused || isPreparing) && (
            <button
              type="button"
              onClick={stopTTS}
              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition"
              title="Stop voice summary"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Replay indicator */}
        {!isPlaying && !isPreparing && (
          <button
            type="button"
            onClick={() => playTTS(report, language)}
            className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Replay Voice</span>
          </button>
        )}
      </div>

      {/* Spoken Text Preview if available */}
      {spokenText && !compact && (
        <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300 italic leading-relaxed">
          "{spokenText}"
        </div>
      )}
    </div>
  );
};

