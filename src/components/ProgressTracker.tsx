import React, { useState, useEffect } from "react";
import { TrendingUp, Sparkles, Upload, Loader2, ArrowRight, CheckCircle2, History } from "lucide-react";
import { ProgressLog, LanguageCode, AssessmentReport } from "../types";
import { compressImage } from "../utils/imageCompressor";
import { getProgressLogs, saveProgressLog, getSavedReports } from "../utils/storage";

interface ProgressTrackerProps {
  language: LanguageCode;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ language }) => {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [conditionName, setConditionName] = useState("Skin Condition");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ProgressLog | null>(null);
  const [pastLogs, setPastLogs] = useState<ProgressLog[]>([]);
  const [savedReports, setSavedReports] = useState<AssessmentReport[]>([]);

  useEffect(() => {
    setPastLogs(getProgressLogs());
    setSavedReports(getSavedReports());
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0], 1000, 1000, 0.85);
      if (type === "before") setBeforeImage(compressed);
      else setAfterImage(compressed);
    }
  };

  const handleCompare = async () => {
    if (!beforeImage || !afterImage) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/compare-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beforeImage,
          afterImage,
          conditionName,
          language,
        }),
      });

      const rawText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Invalid JSON response: ${rawText.slice(0, 80)}`);
      }

      if (data && data.success && data.comparison) {
        const log: ProgressLog = {
          id: `log-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          conditionName,
          beforeImage,
          afterImage,
          ...data.comparison,
        };

        setCurrentResult(log);
        saveProgressLog(log);
        setPastLogs(getProgressLogs());
      } else {
        throw new Error(data?.error || "Failed to generate comparison.");
      }
    } catch (err) {
      console.error("Comparison error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromReport = (rep: AssessmentReport) => {
    if (rep.primaryImage) {
      setBeforeImage(rep.primaryImage);
      setConditionName(rep.possible_condition);
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Skin Lesion Progress & Healing Tracker
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Compare initial "Before" photos with follow-up "After" photos to track recovery trends over time.
        </p>
      </div>

      {/* Select from Saved Reports */}
      {savedReports.length > 0 && !beforeImage && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs space-y-2">
          <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
            <History className="w-4 h-4 text-teal-600" />
            Quick Start: Load 'Before' photo from recent saved report:
          </span>
          <div className="flex flex-wrap gap-2">
            {savedReports.slice(0, 4).map((rep) => (
              <button
                key={rep.id}
                onClick={() => loadFromReport(rep)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-teal-300 dark:border-teal-700 hover:border-teal-500 transition"
              >
                {rep.possible_condition} ({new Date(rep.createdAt).toLocaleDateString()})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Before / After Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Before Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
            <span>1. Initial "BEFORE" Photo</span>
            {beforeImage && (
              <button
                onClick={() => setBeforeImage(null)}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Change
              </button>
            )}
          </h3>

          {beforeImage ? (
            <div className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700">
              <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
            </div>
          ) : (
            <label className="p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "before")}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-teal-600 mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Before Image
              </span>
            </label>
          )}
        </div>

        {/* After Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
            <span>2. Follow-Up "AFTER" Photo</span>
            {afterImage && (
              <button
                onClick={() => setAfterImage(null)}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Change
              </button>
            )}
          </h3>

          {afterImage ? (
            <div className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700">
              <img src={afterImage} alt="After" className="w-full h-full object-cover" />
            </div>
          ) : (
            <label className="p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "after")}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload After Image
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Condition Name & Compare CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <input
          type="text"
          value={conditionName}
          onChange={(e) => setConditionName(e.target.value)}
          placeholder="Condition name (e.g. Contact Dermatitis)"
          className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          onClick={handleCompare}
          disabled={!beforeImage || !afterImage || isLoading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-500/20 disabled:opacity-50 transition cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Progress...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Run AI Comparison Analysis
            </>
          )}
        </button>
      </div>

      {/* Comparison Results Card */}
      {currentResult && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-teal-500/50 shadow-lg space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase">
                {currentResult.overall_status}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Progress Evaluation for {currentResult.conditionName}
              </h3>
            </div>

            <div className="text-center bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/30">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +{currentResult.improvement_percentage}%
              </div>
              <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                Estimated Improvement
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-500 block">Color Change</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {currentResult.color_difference}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-500 block">Texture / Surface</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {currentResult.texture_difference}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-500 block">Swelling Reduction</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {currentResult.swelling_reduction}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-500 block">Pigmentation</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {currentResult.pigmentation_change}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              Detailed Clinical Comparison:
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentResult.detailed_comparison}
            </p>
            <div className="pt-2 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{currentResult.encouragement_or_advice}</span>
            </div>
          </div>
        </div>
      )}

      {/* Past Timeline Log History */}
      {pastLogs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Saved Progress Log History
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex gap-4 text-xs"
              >
                <div className="flex gap-1 shrink-0">
                  <img
                    src={log.beforeImage}
                    alt="Before"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                  />
                  <img
                    src={log.afterImage}
                    alt="After"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                  />
                </div>

                <div className="space-y-1 overflow-hidden">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {log.conditionName}
                  </div>
                  <div className="text-emerald-600 font-semibold">
                    +{log.improvement_percentage}% {log.overall_status}
                  </div>
                  <div className="text-[10px] text-slate-400">{log.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
