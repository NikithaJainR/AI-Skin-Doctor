import React from "react";
import {
  Mic,
  Upload,
  BrainCircuit,
  FileCheck2,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Video,
  Volume2,
  MapPin,
  Lock,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

import doctorBg from "../assets/images/doctor_background_1786341785254.jpg";

interface HeroSectionProps {
  onStartDiagnosis: () => void;
  language: LanguageCode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartDiagnosis,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.English;

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 border border-teal-900/50 shadow-2xl">
        {/* Doctor Themed Background Texture Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url(${doctorBg})` }}
        />

        {/* Animated Background Decorative Blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Powered by Gemini 2.5 Multimodal AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Smart, Instant <br />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              AI Dermatologist
            </span>{" "}
            Assistant
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Understand your skin concerns in seconds. Describe symptoms using voice, upload skin photos or short videos, and receive comprehensive educational assessments with personalized home care, active ingredients advice, and risk analysis.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartDiagnosis}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-3 cursor-pointer"
            >
              <span>{t.startDiagnosis}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-800 rounded-2xl px-4 py-3 bg-slate-900/50 backdrop-blur-sm">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Private & Free • Stored locally in your browser</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl font-bold text-emerald-400">Voice + Media</div>
            <div className="text-xs text-slate-400">Spoken Speech & Video</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl font-bold text-teal-400">Annotated</div>
            <div className="text-xs text-slate-400">Lesion Bounding Boxes</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl font-bold text-cyan-400">7 Languages</div>
            <div className="text-xs text-slate-400">Multilingual Readout</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl font-bold text-amber-400">PDF Report</div>
            <div className="text-xs text-slate-400">Download & Share</div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.howItWorks}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Get an instant preliminary educational report in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Step 1
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Voice Description
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Speak freely about how your skin feels, itching level, duration, and pain.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Step 2
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Upload Photos / Video
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Snap photos or record a short video. Keyframes are automatically extracted.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Step 3
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Multimodal AI Evaluation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Gemini Vision analyzes color, borders, symmetry, and correlates with patient history.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Step 4
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Educational Assessment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Read or listen to the voice summary, download PDF, and chat with AI for questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.features}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Built with modern browser capabilities and zero paid API dependencies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 transition shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Video & Photo Frame Extraction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload short video recordings of moving skin lesions. The browser automatically captures crystal-clear keyframes using HTML5 Canvas for thorough visual inspection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 transition shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Multilingual Voice Readout
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Listen to your assessment spoken naturally in English, Hindi, Kannada, Tamil, Telugu, Malayalam, or Marathi with adjustable speech rate and pitch controls.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 transition shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Nearby Dermatologist Locator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Find verified skin specialists, hospitals, and clinics near your location with direct Google Maps directions, phone numbers, and working hours.
            </p>
          </div>
        </div>
      </section>

      {/* Medical Safety Disclaimer Callout */}
      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 flex flex-col sm:flex-row items-center gap-4">
        <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-sm">Educational Purpose & Privacy Assurance</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            This tool is intended strictly for preliminary health literacy and educational guidance. Your photos and personal information are processed in memory and never permanently stored on external cloud servers.
          </p>
        </div>
      </div>
    </div>
  );
};
