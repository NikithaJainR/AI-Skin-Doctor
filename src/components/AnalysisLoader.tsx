import React, { useState, useEffect } from "react";
import { Stethoscope, Sparkles, CheckCircle2 } from "lucide-react";

const STEPS = [
  "Analyzing uploaded skin photos & video keyframes...",
  "Extracting lesion border, color variations & texture features...",
  "Evaluating symptom timeline with dermatological knowledge...",
  "Checking red flag warnings & emergency criteria...",
  "Formulating home care tips & active ingredient guidance...",
  "Preparing your educational report & voice summary...",
];

export const AnalysisLoader: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 px-6 text-center max-w-lg mx-auto space-y-8">
      {/* Pulse Animation Badge */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
        <span className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse" />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-teal-500/30 relative z-10">
          <Stethoscope className="w-10 h-10 animate-bounce" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          AI Skin Evaluation in Progress
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gemini 2.5 Flash is processing visual & textual medical features
        </p>
      </div>

      {/* Sequential Progress Checklist */}
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-3 text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isDone
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : isCurrent
                  ? "text-teal-600 dark:text-teal-300 font-bold"
                  : "text-slate-400 opacity-40"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <span className="w-4 h-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
