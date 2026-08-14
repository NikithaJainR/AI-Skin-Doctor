import React, { useState, useRef, useEffect } from "react";
import {
  Stethoscope,
  Globe,
  Sun,
  Moon,
  Eye,
  Type as TypeIcon,
  History,
  MapPin,
  HelpCircle,
  PlusCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

export const LANGUAGES_LIST: { code: LanguageCode; label: string; native: string }[] = [
  { code: "English", label: "English", native: "English" },
  { code: "Hindi", label: "Hindi", native: "हिंदी" },
  { code: "Kannada", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "Tamil", label: "Tamil", native: "தமிழ்" },
  { code: "Telugu", label: "Telugu", native: "తెలుగు" },
  { code: "Malayalam", label: "Malayalam", native: "മലയാളം" },
  { code: "Marathi", label: "Marathi", native: "मराठी" },
];

interface NavbarProps {
  onNewAssessment: () => void;
  onOpenHistory: () => void;
  onOpenDoctors: () => void;
  onOpenFAQ: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  largeFont: boolean;
  setLargeFont: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewAssessment,
  onOpenHistory,
  onOpenDoctors,
  onOpenFAQ,
  language,
  setLanguage,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
  largeFont,
  setLargeFont,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.English;
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGES_LIST.find((l) => l.code === language) || LANGUAGES_LIST[0];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors h-14 flex items-center justify-between px-3 sm:px-6">
      {/* Brand Logo & Title */}
      <div
        onClick={onNewAssessment}
        className="flex items-center gap-2 cursor-pointer group shrink-0"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#087F8C] to-[#2F80ED] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform relative">
          <Stethoscope className="w-4 h-4 text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
              AI Skin Doctor
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Digital Clinic
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
            Your AI-powered skin health companion
          </span>
        </div>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onNewAssessment}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1 shadow-xs transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Assessment</span>
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition"
        >
          <History className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="hidden sm:inline">History</span>
        </button>

        <button
          type="button"
          onClick={onOpenDoctors}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Doctors</span>
        </button>

        <button
          type="button"
          onClick={onOpenFAQ}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>FAQ</span>
        </button>

        {/* Interactive Language Selector Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-slate-700 hover:border-teal-500 transition shadow-xs"
            aria-label="Select Language"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-[11px] font-bold">{currentLangObj.native}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 mb-1">
                Select Language / भाषा
              </div>
              {LANGUAGES_LIST.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-teal-50 dark:hover:bg-teal-950/50 transition ${
                      isSelected
                        ? "text-teal-600 dark:text-teal-400 font-bold bg-teal-50/80 dark:bg-teal-950/40"
                        : "text-slate-700 dark:text-slate-200 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">{item.native}</span>
                      {item.native !== item.label && (
                        <span className="text-[10px] text-slate-400">({item.label})</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accessibility & Theme Toggles */}
        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-1.5">
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            title={t.highContrast}
            className={`p-1.5 rounded-lg text-xs transition ${
              highContrast
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setLargeFont(!largeFont)}
            title={t.largeFont}
            className={`p-1.5 rounded-lg text-xs transition ${
              largeFont
                ? "bg-teal-600 text-white font-bold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title="Toggle Dark / Light Mode"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            {theme === "light" ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
