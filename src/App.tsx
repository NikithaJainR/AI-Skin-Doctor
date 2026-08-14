import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Sparkles,
  User,
  History,
  TrendingUp,
  MapPin,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

import {
  AssessmentReport,
  PatientInfo,
  LanguageCode,
} from "./types";

import { Navbar } from "./components/Navbar";
import { CompactPatientInput } from "./components/CompactPatientInput";
import { CompactAIAnalysis } from "./components/CompactAIAnalysis";
import { CompactAIChat } from "./components/CompactAIChat";

import { MoreDetailsModal } from "./components/MoreDetailsModal";
import { FullReportModal } from "./components/FullReportModal";
import { HistoryModal } from "./components/HistoryModal";
import { ProgressTrackerModal } from "./components/ProgressTrackerModal";
import { DermatologistsModal } from "./components/DermatologistsModal";
import { FAQModal } from "./components/FAQModal";
import { FollowUpQuestionsModal } from "./components/FollowUpQuestionsModal";

import { getUserSettings, saveUserSettings } from "./utils/storage";

export default function App() {
  const [settings, setSettings] = useState(() => getUserSettings());
  const [language, setLanguage] = useState<LanguageCode>(
    (settings.language as LanguageCode) || "English"
  );
  const [theme, setTheme] = useState<"light" | "dark">(settings.theme || "light");
  const [highContrast, setHighContrast] = useState(settings.highContrast || false);
  const [largeFont, setLargeFont] = useState(settings.largeFont || false);

  // Mobile Active Tab ("assess" | "result" | "chat")
  const [mobileTab, setMobileTab] = useState<"assess" | "result" | "chat">("assess");

  // Patient Input & Diagnosis State
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    symptoms: [],
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState<AssessmentReport | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal Visibility Controls
  const [isMoreDetailsOpen, setIsMoreDetailsOpen] = useState(false);
  const [isFullReportOpen, setIsFullReportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isDoctorsOpen, setIsDoctorsOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  // Synchronize Theme & Accessibility
  useEffect(() => {
    saveUserSettings({
      language,
      theme,
      highContrast,
      largeFont,
    });

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [language, theme, highContrast, largeFont]);

  // Main Skin Analysis API Trigger
  const handleStartAnalysis = async () => {
    if (images.length === 0 && videoFrames.length === 0 && !spokenTranscript.trim()) {
      setApiError("Please describe your concern or upload at least one photo/video.");
      return;
    }

    setApiError(null);
    setIsAnalyzing(true);
    // Switch mobile view automatically to Result tab when analysis starts
    setMobileTab("result");

    try {
      const response = await fetch("/api/analyze-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          videoFrames,
          patientInfo: {
            ...patientInfo,
            spokenTranscript,
          },
          language,
        }),
      });

      const rawText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error("Non-JSON API response from /api/analyze-skin:", rawText);
        if (response.status === 404) {
          throw new Error("API route not found (404). Please ensure the backend serverless function is deployed.");
        } else if (response.status === 413) {
          throw new Error("Image/video file size is too large for the network payload. Please use a smaller photo.");
        } else if (response.status === 500) {
          throw new Error("Server error (500). Please ensure GEMINI_API_KEY is configured in your Vercel Environment Variables.");
        } else {
          throw new Error(`Server returned status ${response.status}: ${rawText.slice(0, 100)}`);
        }
      }

      if (data && data.success && data.report) {
        const reportWithMeta: AssessmentReport = {
          id: `rep-${Date.now()}`,
          createdAt: new Date().toISOString(),
          primaryImage: images[0] || videoFrames[0] || undefined,
          allImages: [...images, ...videoFrames],
          patientInfo: {
            ...patientInfo,
            spokenTranscript,
          },
          language,
          ...data.report,
        };

        if (
          data.report.follow_up_questions &&
          data.report.follow_up_questions.length > 0 &&
          data.report.confidence_score < 75
        ) {
          setFollowUpQuestions(data.report.follow_up_questions);
          setCurrentReport(reportWithMeta);
        } else {
          setCurrentReport(reportWithMeta);
        }
      } else {
        throw new Error(data?.error || "Failed to analyze skin image.");
      }
    } catch (err: any) {
      console.error("Diagnosis error", err);
      setApiError(err.message || "Skin analysis failed. Please verify connection and retry.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSpokenTranscript("");
    setImages([]);
    setVideoFrames([]);
    setPatientInfo({ symptoms: [] });
    setCurrentReport(null);
    setFollowUpQuestions(null);
    setApiError(null);
    setMobileTab("assess");
  };

  return (
    <div
      className={`min-h-screen h-screen max-h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 bg-doctor-pattern relative ${
        highContrast ? "contrast-125 saturate-150" : ""
      } ${largeFont ? "text-base" : "text-sm"}`}
    >
      {/* Background Decorative Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30 dark:opacity-20">
        <svg
          className="absolute top-1/4 -left-10 w-[120%] text-teal-500/10 dark:text-teal-400/10 stroke-current"
          height="120"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 1200 120"
        >
          <path d="M0,60 L200,60 L220,20 L240,100 L260,30 L280,80 L300,60 L600,60 L620,10 L640,110 L660,20 L680,90 L700,60 L1200,60" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Minimal Top Navigation */}
        <Navbar
          onNewAssessment={handleReset}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenDoctors={() => setIsDoctorsOpen(true)}
          onOpenFAQ={() => setIsFAQOpen(true)}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          largeFont={largeFont}
          setLargeFont={setLargeFont}
        />

        {/* Mobile Viewport Navigation Tab Switcher (< lg) */}
        <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-1 shrink-0 z-20">
          <button
            onClick={() => setMobileTab("assess")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              mobileTab === "assess"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Assess
          </button>
          <button
            onClick={() => setMobileTab("result")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              mobileTab === "result"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Result
          </button>
          <button
            onClick={() => setMobileTab("chat")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              mobileTab === "chat"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Chat
          </button>
        </div>

        {/* MAIN DASHBOARD CONTENT AREA (100vh Viewport Grid) */}
        <main className="flex-1 min-h-0 overflow-hidden p-2.5 sm:p-3 lg:p-4 w-full max-w-full mx-auto">
          {/* DESKTOP 3-COLUMN GRID VIEW (30% | 40% | 30%) */}
          <div className="h-full w-full grid grid-cols-1 lg:grid-cols-[3.2fr_5.6fr_3.2fr] gap-3 lg:gap-4 overflow-hidden min-h-0">
            {/* COLUMN 1: LEFT — "YOUR SKIN CONCERN" (~30%) */}
            <div
              className={`h-full min-h-0 flex flex-col justify-between overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 doctor-card-glow shadow-xs ${
                mobileTab === "assess" ? "block" : "hidden lg:flex"
              }`}
            >
              <CompactPatientInput
                patientInfo={patientInfo}
                setPatientInfo={setPatientInfo}
                spokenTranscript={spokenTranscript}
                setSpokenTranscript={setSpokenTranscript}
                images={images}
                setImages={setImages}
                videoFrames={videoFrames}
                setVideoFrames={setVideoFrames}
                language={language}
                setLanguage={setLanguage}
                onAnalyze={handleStartAnalysis}
                isAnalyzing={isAnalyzing}
                onOpenMoreDetails={() => setIsMoreDetailsOpen(true)}
                apiError={apiError}
              />
            </div>

            {/* COLUMN 2: CENTER — "AI DERMATOLOGIST" (~40%) */}
            <div
              className={`h-full min-h-0 flex flex-col justify-between overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 doctor-card-glow shadow-xs ${
                mobileTab === "result" ? "block" : "hidden lg:flex"
              }`}
            >
              <CompactAIAnalysis
                report={currentReport}
                isAnalyzing={isAnalyzing}
                language={language}
                onOpenFullReport={() => setIsFullReportOpen(true)}
                onOpenProgressTracker={() => setIsProgressOpen(true)}
              />
            </div>

            {/* COLUMN 3: RIGHT — "ASK AI DERMATOLOGIST" (~30%) */}
            <div
              className={`h-full min-h-0 flex flex-col justify-between overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 doctor-card-glow shadow-xs ${
                mobileTab === "chat" ? "block" : "hidden lg:flex"
              }`}
            >
              <CompactAIChat
                report={currentReport}
                language={language}
                setLanguage={setLanguage}
              />
            </div>
          </div>
        </main>

        {/* Bottom Medical Disclaimer Strip */}
        <footer className="bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 px-3 py-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 shrink-0">
          <ShieldAlert className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-medium text-center">
            AI Skin Doctor provides educational information and does not replace professional medical diagnosis.
          </span>
        </footer>
      </div>

      {/* MODALS */}
      <MoreDetailsModal
        isOpen={isMoreDetailsOpen}
        onClose={() => setIsMoreDetailsOpen(false)}
        patientInfo={patientInfo}
        setPatientInfo={setPatientInfo}
      />

      <FullReportModal
        isOpen={isFullReportOpen}
        onClose={() => setIsFullReportOpen(false)}
        report={currentReport}
        language={language}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectReport={(rep) => {
          setCurrentReport(rep);
          setIsFullReportOpen(true);
        }}
      />

      <ProgressTrackerModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        language={language}
      />

      <DermatologistsModal
        isOpen={isDoctorsOpen}
        onClose={() => setIsDoctorsOpen(false)}
      />

      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />

      {followUpQuestions && currentReport && (
        <FollowUpQuestionsModal
          questions={followUpQuestions}
          onSubmit={async (answers) => {
            setFollowUpQuestions(null);
            setIsAnalyzing(true);
            try {
              const res = await fetch("/api/analyze-skin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  images: currentReport.allImages,
                  patientInfo: {
                    ...currentReport.patientInfo,
                    followUpAnswers: answers,
                  },
                  language,
                }),
              });
              const data = await res.json();
              if (data.success && data.report) {
                setCurrentReport({
                  ...currentReport,
                  ...data.report,
                });
              }
            } catch (err) {
              console.error("Refined diagnosis failed", err);
            } finally {
              setIsAnalyzing(false);
            }
          }}
          onSkip={() => setFollowUpQuestions(null)}
        />
      )}
    </div>
  );
}
