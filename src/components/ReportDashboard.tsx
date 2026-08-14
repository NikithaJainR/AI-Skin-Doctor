import React, { useState, useEffect } from "react";
import {
  Download,
  Bookmark,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  HeartHandshake,
  Pill,
  Ban,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";
import { AssessmentReport, LanguageCode } from "../types";
import { RiskMeterGauge } from "./RiskMeterGauge";
import { AnnotatedCanvas } from "./AnnotatedCanvas";
import { AIChatAssistant } from "./AIChatAssistant";
import { AIVoiceSummaryPlayer } from "./AIVoiceSummaryPlayer";
import { generateReportPDF } from "../utils/pdfGenerator";
import { saveReport } from "../utils/storage";

interface ReportDashboardProps {
  report: AssessmentReport;
  onNewDiagnosis: () => void;
  language: LanguageCode;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  report,
  onNewDiagnosis,
  language,
}) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Save report locally on view
    saveReport(report);
    setIsSaved(true);
  }, [report]);

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Top Action Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onNewDiagnosis}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Start New Assessment
        </button>

        <div className="flex items-center gap-2">
          {/* Download PDF */}
          <button
            onClick={() => generateReportPDF(report)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>

          {/* Bookmark Indicator */}
          <div className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 fill-emerald-600" />
            <span>Saved Locally</span>
          </div>
        </div>
      </div>

      {/* Risk Gauge Bar */}
      <RiskMeterGauge
        severity={report.severity}
        confidenceScore={report.confidence_score}
      />

      {/* Primary Condition Title Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Plausible Condition Identified
          </div>
          <span className="text-xs text-slate-400">
            Assessed: {new Date(report.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {report.possible_condition}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {report.summary}
        </p>
      </div>

      {/* Voice Output Audio Player Bar */}
      <AIVoiceSummaryPlayer report={report} language={language} />

      {/* Annotated Lesion Canvas if Image Exists */}
      {report.primaryImage && (
        <AnnotatedCanvas
          imageUrl={report.primaryImage}
          regions={report.annotated_regions}
        />
      )}

      {/* Key Findings & Reasoning Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Observations */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Visual Observations & Signs
          </h3>
          <ul className="space-y-2">
            {(report.visual_observations || []).map((obs, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Possible Causes & Differential */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Possible Causes & Triggers
          </h3>
          <ul className="space-y-2">
            {(report.possible_causes || []).map((cause, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Care & Active Ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Home Care */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Gentle Home Care
          </h3>
          <ul className="space-y-2">
            {(report.recommended_home_care || []).map((item, idx) => (
              <li key={idx} className="text-xs text-slate-600 dark:text-slate-300">
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Ingredients to Look For */}
        <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-3">
          <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Beneficial Ingredients to Look For
          </h3>
          <ul className="space-y-2">
            {(report.ingredients_to_look_for || []).map((ing, idx) => (
              <li
                key={idx}
                className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ingredients to Avoid */}
        <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 shadow-sm space-y-3">
          <h3 className="font-bold text-rose-900 dark:text-rose-200 text-sm flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Ingredients / Products to Avoid
          </h3>
          <ul className="space-y-2">
            {(report.ingredients_to_avoid || []).map((ing, idx) => (
              <li
                key={idx}
                className="text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Doctor Visit & Red Flags Warning Callout */}
      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 shadow-sm space-y-3">
        <h3 className="font-bold text-base flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          When to Visit a Dermatologist & Red Flag Criteria
        </h3>
        <p className="text-xs leading-relaxed">
          {report.when_to_visit_doctor}
        </p>

        {report.red_flags && report.red_flags.length > 0 && (
          <div className="pt-2 border-t border-amber-200 dark:border-amber-800/80">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block mb-1">
              Immediate Emergency Red Flags:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.red_flags.map((flag, idx) => (
                <li
                  key={idx}
                  className="text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Embedded AI Chat Assistant */}
      <AIChatAssistant report={report} language={language} />
    </div>
  );
};
