import React from "react";
import {
  Stethoscope,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  FileText,
  Layers,
} from "lucide-react";
import { AssessmentReport, LanguageCode } from "../types";
import { AIVoiceSummaryPlayer } from "./AIVoiceSummaryPlayer";

interface CompactAIAnalysisProps {
  report: AssessmentReport | null;
  isAnalyzing: boolean;
  language: LanguageCode;
  onOpenFullReport: () => void;
  onOpenProgressTracker: () => void;
}

export const CompactAIAnalysis: React.FC<CompactAIAnalysisProps> = ({
  report,
  isAnalyzing,
  language,
  onOpenFullReport,
  onOpenProgressTracker,
}) => {
  // Severity Badge Colors
  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
      case "moderate":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300";
      case "urgent":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
    }
  };

  return (
    <div className="flex flex-col h-full justify-between overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            AI DERMATOLOGIST
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Clinical Assessment
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Gemini Vision clinical preliminary evaluation
        </p>
      </div>

      {/* STATE 1: EMPTY STATE */}
      {!isAnalyzing && !report && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-teal-100/80 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs text-xl border border-teal-200 dark:border-teal-800">
            🩺
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
              Ready to analyze your skin.
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Upload an image and describe your concern on the left panel to begin.
            </p>
          </div>
        </div>
      )}

      {/* STATE 2: LOADING STATE */}
      {isAnalyzing && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-4 space-y-3 my-auto">
          <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md">
              <Stethoscope className="w-5 h-5 animate-bounce" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
              Analyzing Skin Issue...
            </h3>
            <p className="text-[10px] text-slate-500">
              Evaluating visual lesions & symptom parameters
            </p>
          </div>
        </div>
      )}

      {/* STATE 3: COMPLETED REPORT */}
      {!isAnalyzing && report && (
        <div className="flex flex-col justify-between flex-1 min-h-0 space-y-2">
          {/* Main Info Stack */}
          <div className="flex flex-col justify-between flex-1 min-h-0 space-y-1.5">
            {/* Condition Header Card with Uploaded Image Preview */}
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 text-white shadow-md border border-teal-800/60 relative overflow-hidden space-y-1.5">
              {report.primaryImage && (
                <div className="flex items-center gap-2 pb-1.5 border-b border-teal-800/50">
                  <img
                    src={report.primaryImage}
                    alt="Analyzed skin"
                    className="w-10 h-10 rounded-lg object-cover border border-teal-500/50 shrink-0"
                  />
                  <div>
                    <span className="text-[9px] font-bold text-teal-300 uppercase tracking-wider">
                      Analyzed Skin Scan
                    </span>
                    <p className="text-[10px] text-slate-300 font-medium line-clamp-1">
                      Visual Lesion Assessment
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-2 relative z-10">
                <div>
                  <span className="text-[9px] font-bold tracking-wider uppercase text-teal-400">
                    Possible Condition
                  </span>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    {report.possible_condition}
                  </h3>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getSeverityBadge(
                    report.severity
                  )}`}
                >
                  {report.severity} Severity
                </span>
              </div>

              {/* Confidence Score Bar */}
              <div className="pt-1 border-t border-teal-800/40 relative z-10 space-y-0.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-300">AI Match Confidence</span>
                  <span className="text-teal-300">{report.confidence_score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(10, report.confidence_score))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Key Observations */}
            <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <h4 className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Layers className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Key Observations
              </h4>
              <ul className="space-y-0.5 text-[11px] text-slate-700 dark:text-slate-300">
                {report.visual_observations.slice(0, 3).map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-teal-500 font-bold">•</span>
                    <span className="line-clamp-1">{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <h4 className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Recommendations
              </h4>
              <ul className="space-y-0.5 text-[11px] text-slate-700 dark:text-slate-300">
                {report.recommended_home_care.slice(0, 3).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="line-clamp-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gemini TTS Voice Summary Player */}
            <AIVoiceSummaryPlayer report={report} language={language} compact={true} autoPlay={true} />
          </div>

          {/* Action Buttons: Full Report & Progress */}
          <div className="pt-1.5 shrink-0 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenFullReport}
              className="py-2.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Full Assessment →</span>
            </button>

            <button
              type="button"
              onClick={onOpenProgressTracker}
              className="py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
              <span>Progress</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
