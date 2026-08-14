import React from "react";
import { User, Activity, AlertCircle, FileText, Check } from "lucide-react";
import { PatientInfo, SkinTone, SkinType } from "../types";

interface PatientQuestionnaireProps {
  info: PatientInfo;
  setInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
}

export const SKIN_TONES: { label: SkinTone; color: string; desc: string }[] = [
  { label: "Type I (Very Fair)", color: "#f8fafc", desc: "Always burns, never tans" },
  { label: "Type II (Fair)", color: "#f1f5f9", desc: "Usually burns, tans minimally" },
  { label: "Type III (Medium)", color: "#e2e8f0", desc: "Sometimes mild burn, tans uniformly" },
  { label: "Type IV (Olive)", color: "#cbd5e1", desc: "Rarely burns, tans easily" },
  { label: "Type V (Brown)", color: "#94a3b8", desc: "Very rarely burns, tans dark" },
  { label: "Type VI (Dark Brown/Black)", color: "#475569", desc: "Never burns, deeply pigmented" },
];

export const SKIN_TYPES: SkinType[] = ["Normal", "Oily", "Dry", "Combination", "Sensitive"];

export const ALL_SYMPTOMS = [
  "Itching",
  "Pain",
  "Burning",
  "Dryness",
  "Swelling",
  "Pus",
  "Bleeding",
  "Rash",
  "Acne",
  "Pigmentation",
  "Hair Loss",
  "Moles",
  "Flaking",
  "Blisters",
  "Redness",
  "Scaling",
];

export const PatientQuestionnaire: React.FC<PatientQuestionnaireProps> = ({
  info,
  setInfo,
}) => {
  const toggleSymptom = (symptom: string) => {
    setInfo((prev) => {
      const exists = prev.symptoms.includes(symptom);
      const updated = exists
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms: updated };
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          Patient Details & Medical Questionnaire
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Providing accurate context improves the clinical relevance of your AI evaluation.
        </p>
      </div>

      {/* Basic Demographics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Age:
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={info.age || ""}
            onChange={(e) => setInfo({ ...info, age: e.target.value })}
            placeholder="e.g. 28"
            className="w-full p-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Gender:
          </label>
          <select
            value={info.gender || ""}
            onChange={(e) => setInfo({ ...info, gender: e.target.value })}
            className="w-full p-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Non-Binary">Non-Binary</option>
            <option value="Other">Other / Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Symptom Duration:
          </label>
          <select
            value={info.duration || ""}
            onChange={(e) => setInfo({ ...info, duration: e.target.value })}
            className="w-full p-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Duration</option>
            <option value="Less than 24 hours">Less than 24 hours</option>
            <option value="1-3 days">1-3 days</option>
            <option value="1 week">1 week</option>
            <option value="2-3 weeks">2-3 weeks</option>
            <option value="1-3 months">1-3 months</option>
            <option value="Chronic (>6 months)">Chronic (&gt;6 months)</option>
          </select>
        </div>
      </div>

      {/* Fitzpatrick Skin Tone Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Skin Tone (Fitzpatrick Scale):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SKIN_TONES.map((tone) => {
            const isSelected = info.skinTone === tone.label;
            return (
              <button
                key={tone.label}
                type="button"
                onClick={() => setInfo({ ...info, skinTone: tone.label })}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/30"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-slate-400 shrink-0 shadow-inner"
                  style={{ backgroundColor: tone.color }}
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {tone.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{tone.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skin Type Badges */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Overall Skin Type:
        </label>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((type) => {
            const isSelected = info.skinType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setInfo({ ...info, skinType: type })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  isSelected
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Symptoms Checkboxes */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Select All Active Symptoms:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ALL_SYMPTOMS.map((symptom) => {
            const isChecked = info.symptoms.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`p-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition ${
                  isChecked
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                <span>{symptom}</span>
                {isChecked && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional History Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Medical History / Conditions:
          </label>
          <input
            type="text"
            value={info.medicalHistory || ""}
            onChange={(e) => setInfo({ ...info, medicalHistory: e.target.value })}
            placeholder="e.g. Asthma, Eczema, Diabetes"
            className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Current Medications:
          </label>
          <input
            type="text"
            value={info.medications || ""}
            onChange={(e) => setInfo({ ...info, medications: e.target.value })}
            placeholder="e.g. Topicals, Steroids, Antibiotics"
            className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Known Allergies:
          </label>
          <input
            type="text"
            value={info.allergies || ""}
            onChange={(e) => setInfo({ ...info, allergies: e.target.value })}
            placeholder="e.g. Penicillin, Fragrances, Latex"
            className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  );
};
