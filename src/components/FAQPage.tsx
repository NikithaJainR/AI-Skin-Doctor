import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles, BookOpen } from "lucide-react";

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is AI Skin Doctor a replacement for a real doctor's diagnosis?",
      a: "No. AI Skin Doctor is strictly an educational self-awareness tool. It uses Gemini AI to evaluate visual patterns and correlate symptoms to help you prepare informed questions for a real dermatologist. Never start prescription medications based solely on AI output.",
    },
    {
      q: "How does image and video keyframe extraction work?",
      a: "When you upload skin photos or record a short video, your browser uses HTML5 Canvas to compress images and extract clear keyframes locally. The images are processed in memory and analyzed by Gemini 2.5 Flash.",
    },
    {
      q: "Are my uploaded photos kept private?",
      a: "Yes! Your photos remain completely private. They are processed temporarily during analysis and saved strictly inside your browser's local IndexedDB and LocalStorage. No photos are permanently stored on cloud databases.",
    },
    {
      q: "When should I seek immediate emergency medical care?",
      a: "Seek emergency care immediately if you experience rapid spreading rash accompanied by high fever, difficulty breathing, facial or lip swelling, open oozing sores over large body areas, extreme severe pain, or rapidly changing dark moles.",
    },
    {
      q: "How can I identify my Fitzpatrick skin tone and type?",
      a: "Fitzpatrick scale ranges from Type I (very fair, always burns) to Type VI (deeply pigmented, never burns). Skin types include Oily (excess sebum), Dry (flaking or tight), Combination (oily T-zone), and Sensitive (prone to redness/stinging).",
    },
    {
      q: "What active ingredients should I generally avoid during an active rash flare-up?",
      a: "During an active inflamed rash, avoid strong AHA/BHA chemical exfoliants, high-concentration retinoids, synthetic heavy fragrances, denatured alcohol, and harsh physical scrubs. Stick to gentle fragrance-free cleansers and ceramides.",
    },
  ];

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Skin Health & AI Doctor FAQ
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Frequently asked questions regarding AI skin evaluation, privacy, and emergency warning signs.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-teal-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Emergency Callout */}
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-2 text-rose-700 dark:text-rose-300">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Emergency Warning Signs
        </h3>
        <p className="text-xs leading-relaxed">
          If you or someone else experiences sudden facial swelling, wheezing, blistering over more than 10% of the body, or high fever with purpuric lesions, call your local emergency services (112 or 911) immediately.
        </p>
      </div>
    </div>
  );
};
