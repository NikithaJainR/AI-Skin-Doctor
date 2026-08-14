import React, { useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Upload,
  ImageIcon,
  Video,
  X,
  Plus,
  Search,
  Loader2,
  Stethoscope,
  Trash2,
  AlertTriangle,
  Globe,
  Camera,
  FolderUp,
} from "lucide-react";
import { PatientInfo, LanguageCode } from "../types";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { compressImage } from "../utils/imageCompressor";
import { extractVideoFrames } from "../utils/video";
import { CameraCaptureModal } from "./CameraCaptureModal";

interface CompactPatientInputProps {
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  spokenTranscript: string;
  setSpokenTranscript: (text: string) => void;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  videoFrames: string[];
  setVideoFrames: React.Dispatch<React.SetStateAction<string[]>>;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onOpenMoreDetails: () => void;
  apiError: string | null;
}

const QUICK_SYMPTOMS = [
  "Itching",
  "Pain",
  "Redness",
  "Burning",
  "Dryness",
  "Rash",
];

const LANGUAGES_LIST: { code: LanguageCode; native: string }[] = [
  { code: "English", native: "English" },
  { code: "Hindi", native: "हिंदी" },
  { code: "Kannada", native: "ಕನ್ನಡ" },
  { code: "Tamil", native: "தமிழ்" },
  { code: "Telugu", native: "తెలుగు" },
  { code: "Malayalam", native: "മലയാളം" },
  { code: "Marathi", native: "मराठी" },
];

export const CompactPatientInput: React.FC<CompactPatientInputProps> = ({
  patientInfo,
  setPatientInfo,
  spokenTranscript,
  setSpokenTranscript,
  images,
  setImages,
  videoFrames,
  setVideoFrames,
  language,
  setLanguage,
  onAnalyze,
  isAnalyzing,
  onOpenMoreDetails,
  apiError,
}) => {
  const {
    isListening,
    isSupported,
    error: speechError,
    clearError,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const [isUploading, setIsUploading] = useState(false);
  const [cameraModal, setCameraModal] = useState<{ isOpen: boolean; mode: "photo" | "video" }>({
    isOpen: false,
    mode: "photo",
  });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const toggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language, spokenTranscript, (updatedText) => {
        setSpokenTranscript(updatedText);
      });
    }
  };

  const handleClearTranscript = () => {
    setSpokenTranscript("");
    clearError();
  };

  const handleMediaUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    try {
      const newImages: string[] = [];
      const newVideoFrames: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const compressed = await compressImage(file, 1000, 1000, 0.8);
          newImages.push(compressed);
        } else if (file.type.startsWith("video/")) {
          const extracted = await extractVideoFrames(file, 2);
          newVideoFrames.push(...extracted);
        }
      }

      if (newImages.length > 0) setImages((prev) => [...prev, ...newImages]);
      if (newVideoFrames.length > 0) setVideoFrames((prev) => [...prev, ...newVideoFrames]);
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setPatientInfo((prev) => {
      const exists = prev.symptoms.includes(symptom);
      const updated = exists
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms: updated };
    });
  };

  const hasInput = images.length > 0 || videoFrames.length > 0 || spokenTranscript.trim().length > 0;

  return (
    <div className="flex flex-col h-full justify-between overflow-hidden">
      {/* Top Content Stack */}
      <div className="flex flex-col justify-between flex-1 min-h-0 space-y-2">
        {/* Panel Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
              <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              YOUR SKIN CONCERN
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Diagnostic Input
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Describe symptoms or record your voice concern
          </p>
        </div>

        {/* Consultation Language Selection Bar */}
        <div className="p-1.5 px-2 rounded-xl bg-teal-500/10 dark:bg-slate-800/80 border border-teal-500/30 dark:border-teal-500/20 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Language / भाषा:</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="text-xs font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-xs"
          >
            {LANGUAGES_LIST.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.code})
              </option>
            ))}
          </select>
        </div>

        {/* 1. Describe Your Concern */}
        <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              🎙️ Describe your concern
            </span>

            <div className="flex items-center gap-1">
              {/* Clear button if transcript exists */}
              {spokenTranscript.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleClearTranscript}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-0.5 transition"
                  title="Clear text input"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}

              {/* Voice Record Button */}
              {isSupported ? (
                <button
                  type="button"
                  onClick={toggleListen}
                  aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse shadow-xs"
                      : "bg-teal-600/10 text-teal-700 dark:text-teal-300 hover:bg-teal-600/20"
                  }`}
                >
                  {isListening ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                      <MicOff className="w-3 h-3" />
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      <span>Voice Record</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
                  Voice input unsupport in browser
                </span>
              )}
            </div>
          </div>

          <textarea
            value={spokenTranscript}
            onChange={(e) => setSpokenTranscript(e.target.value)}
            placeholder={
              isListening
                ? "🔴 Listening... Speak now..."
                : "Type or speak symptoms (e.g. Red itchy rash on arm for 2 days)..."
            }
            rows={2}
            className={`w-full p-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none transition ${
              isListening
                ? "border-rose-500/80 ring-1 ring-rose-500/40"
                : "border-slate-200 dark:border-slate-700"
            }`}
          />

          {/* Microphone status or error alert */}
          {speechError && (
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-[10px] text-rose-700 dark:text-rose-300 flex items-start justify-between gap-1">
              <div className="flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* 2. Upload or Capture Media */}
        <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Upload or Capture
            </span>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
            className="hidden"
          />

          {/* Compact 4-button action grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="px-1.5 py-1 rounded-lg text-[10px] font-bold bg-teal-600 text-white hover:bg-teal-500 flex items-center justify-center gap-1 shadow-2xs transition"
            >
              <FolderUp className="w-3 h-3" />
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              onClick={() => setCameraModal({ isOpen: true, mode: "photo" })}
              className="px-1.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center justify-center gap-1 shadow-2xs transition"
            >
              <Camera className="w-3 h-3" />
              <span>Take Photo</span>
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="px-1.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-600 text-white hover:bg-cyan-500 flex items-center justify-center gap-1 shadow-2xs transition"
            >
              <FolderUp className="w-3 h-3" />
              <span>Upload Video</span>
            </button>

            <button
              type="button"
              onClick={() => setCameraModal({ isOpen: true, mode: "video" })}
              className="px-1.5 py-1 rounded-lg text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-500 flex items-center justify-center gap-1 shadow-2xs transition"
            >
              <Video className="w-3 h-3" />
              <span>Record Video</span>
            </button>
          </div>

          {/* Compact Drop Zone / Thumbnail Bar */}
          <div
            onClick={() => imageInputRef.current?.click()}
            className="p-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center cursor-pointer hover:border-teal-500 transition min-h-[38px] flex items-center justify-center"
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-1 text-[10px] text-teal-600 dark:text-teal-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processing media...</span>
              </div>
            ) : images.length === 0 && videoFrames.length === 0 ? (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <Upload className="w-3 h-3 text-slate-400" />
                Tap to attach skin photo or video clip
              </p>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {images.map((img, i) => (
                  <div key={`img-${i}`} className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 group">
                    <img src={img} alt="Skin" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white text-center font-bold truncate px-0.5">
                      📷 Image
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute top-0 right-0 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ))}
                {videoFrames.map((vid, i) => (
                  <div key={`vid-${i}`} className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 border border-cyan-500/50 group">
                    <img src={vid} alt="Vid" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-cyan-950/80 text-[7px] text-cyan-200 text-center font-bold truncate px-0.5">
                      🎥 Video
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoFrames((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute top-0 right-0 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Basic Information Grid */}
        <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                Duration:
              </label>
              <select
                value={patientInfo.duration || ""}
                onChange={(e) => setPatientInfo({ ...patientInfo, duration: e.target.value })}
                className="w-full p-1 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="">Select duration</option>
                <option value="Less than 24 hours">&lt; 24 hrs</option>
                <option value="1-3 days">1-3 days</option>
                <option value="1 week">1 week</option>
                <option value="2-3 weeks">2-3 weeks</option>
                <option value="1-3 months">1-3 months</option>
                <option value="Chronic (>6 months)">Chronic (&gt;6 months)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenMoreDetails}
              className="mt-3 text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline shrink-0"
            >
              More details +
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Symptoms:
            </label>
            <div className="flex flex-wrap gap-1">
              {QUICK_SYMPTOMS.map((sym) => {
                const active = patientInfo.symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                      active
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500"
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="pt-2 shrink-0 space-y-1">
        {apiError && (
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 px-1">
            ⚠️ {apiError}
          </p>
        )}

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing || !hasInput}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white font-black text-xs sm:text-sm shadow-md shadow-teal-600/20 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 transition"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Skin...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>🔍 ANALYZE MY SKIN</span>
            </>
          )}
        </button>
      </div>
      {/* Direct Camera Photo & Video Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModal.isOpen}
        mode={cameraModal.mode}
        onClose={() => setCameraModal({ ...cameraModal, isOpen: false })}
        onPhotoCaptured={(dataUrl) => setImages((prev) => [...prev, dataUrl])}
        onVideoRecorded={(frames) => setVideoFrames((prev) => [...prev, ...frames])}
      />
    </div>
  );
};
