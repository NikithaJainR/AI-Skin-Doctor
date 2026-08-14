import React from "react";
import { X, FileText, Download, Share2, ShieldAlert } from "lucide-react";
import { AssessmentReport, LanguageCode } from "../types";
import { ReportDashboard } from "./ReportDashboard";

interface FullReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AssessmentReport | null;
  language: LanguageCode;
}

export const FullReportModal: React.FC<FullReportModalProps> = ({
  isOpen,
  onClose,
  report,
  language,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 relative">
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Detailed Clinical Assessment Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full AI evaluation, annotated regions & educational care guidelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Report Dashboard */}
        <ReportDashboard
          report={report}
          onNewDiagnosis={onClose}
          language={language}
        />
      </div>
    </div>
  );
};
