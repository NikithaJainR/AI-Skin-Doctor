import React, { useState } from "react";
import { HelpCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface FollowUpQuestionsModalProps {
  questions: string[];
  onSubmitAnswers: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

export const FollowUpQuestionsModal: React.FC<FollowUpQuestionsModalProps> = ({
  questions,
  onSubmitAnswers,
  onSkip,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleTextChange = (q: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [q]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
            Smart Follow-Up Clarification
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            Quick Follow-Up Questions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Answering these questions helps refine the AI's clinical precision.
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {idx + 1}. {q}
              </label>
              <input
                type="text"
                value={answers[q] || ""}
                onChange={(e) => handleTextChange(q, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            Skip to Report
          </button>
          <button
            type="button"
            onClick={() => onSubmitAnswers(answers)}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-500/20"
          >
            <span>Submit Answers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
