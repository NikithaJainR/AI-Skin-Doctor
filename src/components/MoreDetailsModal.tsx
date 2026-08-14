import React from "react";
import { X, User, Activity, Check, FileText } from "lucide-react";
import { PatientInfo, SkinTone, SkinType } from "../types";
import { SKIN_TONES, ALL_SYMPTOMS } from "./PatientQuestionnaire";

interface MoreDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
}

export const MoreDetailsModal: React.FC<MoreDetailsModalProps> = ({
  isOpen,
  onClose,
  patientInfo,
  setPatientInfo,
}) => {
  if (!isOpen) return null;

  const toggleSymptom = (symptom: string) => {
    setPatientInfo((prev) => {
      const exists = prev.symptoms.includes(symptom);
      const updated = exists
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms: updated };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              More Patient Details
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide additional medical context for higher diagnostic precision
            </p>
          </div>
        </div>

        {/* Gender & Medical History */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gender:
            </label>
            <select
              value={patientInfo.gender || ""}
              onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Medical History:
            </label>
            <input
              type="text"
              value={patientInfo.medicalHistory || ""}
              onChange={(e) => setPatientInfo({ ...patientInfo, medicalHistory: e.target.value })}
              placeholder="e.g. Asthma, Eczema"
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Current Medications & Allergies */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Medications:
            </label>
            <input
              type="text"
              value={patientInfo.medications || ""}
              onChange={(e) => setPatientInfo({ ...patientInfo, medications: e.target.value })}
              placeholder="e.g. Steroids, Antibiotics"
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Known Allergies:
            </label>
            <input
              type="text"
              value={patientInfo.allergies || ""}
              onChange={(e) => setPatientInfo({ ...patientInfo, allergies: e.target.value })}
              placeholder="e.g. Penicillin, Latex"
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Fitzpatrick Skin Tone Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Fitzpatrick Skin Tone:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SKIN_TONES.map((tone) => {
              const isSelected = patientInfo.skinTone === tone.label;
              return (
                <button
                  key={tone.label}
                  type="button"
                  onClick={() => setPatientInfo({ ...patientInfo, skinTone: tone.label })}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                    isSelected
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/50"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-slate-400 shrink-0"
                    style={{ backgroundColor: tone.color }}
                  />
                  <div className="overflow-hidden text-[10px] font-bold text-slate-900 dark:text-white truncate">
                    {tone.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* All Symptoms Grid */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            All Active Symptoms:
          </label>
          <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1">
            {ALL_SYMPTOMS.map((sym) => {
              const isChecked = patientInfo.symptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`p-1.5 rounded-lg text-[10px] font-medium border text-left flex items-center justify-between ${
                    isChecked
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className="truncate">{sym}</span>
                  {isChecked && <Check className="w-3 h-3 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition"
        >
          Save Details & Close
        </button>
      </div>
    </div>
  );
};
