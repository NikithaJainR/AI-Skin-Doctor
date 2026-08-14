import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AssessmentReport, ChatMessage, LanguageCode } from "../types";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useGeminiTTS } from "../hooks/useGeminiTTS";

interface CompactAIChatProps {
  report: AssessmentReport | null;
  language: LanguageCode;
  setLanguage?: (lang: LanguageCode) => void;
}

const LANGUAGES_LIST: { code: LanguageCode; native: string }[] = [
  { code: "English", native: "English" },
  { code: "Hindi", native: "हिंदी" },
  { code: "Kannada", native: "ಕನ್ನಡ" },
  { code: "Tamil", native: "தமிழ்" },
  { code: "Telugu", native: "తెలుగు" },
  { code: "Malayalam", native: "മലയാളം" },
  { code: "Marathi", native: "मराठी" },
];

export const CompactAIChat: React.FC<CompactAIChatProps> = ({
  report,
  language,
  setLanguage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: report
        ? `Hello! I have reviewed your assessment for ${report.possible_condition}. Tap the microphone below or ask any follow-up questions about sunscreen, active ingredients, or care!`
        : "Hello! I am your Voice AI Dermatologist. Tap the microphone to ask any skin-related question.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const {
    isPreparing: isTTSPreparing,
    isPlaying: isTTSPlaying,
    isPaused: isTTSPaused,
    spokenText,
    isFallbackMode,
    playTTS,
    pauseTTS,
    resumeTTS,
    stopTTS,
  } = useGeminiTTS();

  const presetQuestions = [
    "Can I use sunscreen?",
    "Ingredients to avoid?",
    "Is this contagious?",
    "When to see a doctor?",
  ];

  // Process a user question (from voice or button or text)
  const processQuestion = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isProcessing) return;

    // Stop listening & stop previous TTS
    stopListening();
    stopTTS();

    setLastQuestion(text);
    setIsProcessing(true);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          previousAssessment: report,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
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

      if (data && data.success && data.reply) {
        const replyText = data.reply;
        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);

        // Speak the reply aloud via Gemini TTS!
        await playTTS(null, language, replyText);
      } else {
        throw new Error(data?.error || "Failed to get AI response.");
      }
    } catch (err) {
      console.warn("Voice AI Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: "I apologize, I couldn't process that question right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Microphone Listening
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopTTS();
      startListening(language, "", (transcriptText) => {
        if (transcriptText && transcriptText.trim().length > 2) {
          processQuestion(transcriptText);
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-2 overflow-hidden">
      {/* Section Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
            <span className="text-base">🎙️</span>
            VOICE AI DERMATOLOGIST
          </h2>
          
          {setLanguage ? (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 focus:outline-none cursor-pointer"
            >
              {LANGUAGES_LIST.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {language}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Spoken consultations & natural doctor voice in {language}
        </p>
      </div>

      {/* Primary Voice Action Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white shadow-md border border-teal-500/30 flex flex-col items-center justify-center space-y-2 shrink-0">
        <div className="text-center space-y-0.5">
          <div className="text-xs font-bold text-teal-300 flex items-center justify-center gap-1">
            {isListening ? (
              <span className="text-rose-400 animate-pulse font-extrabold flex items-center gap-1">
                🔴 Listening... Speak now
              </span>
            ) : isProcessing ? (
              <span className="text-amber-300 animate-pulse font-extrabold flex items-center gap-1">
                ✦ AI Dermatologist thinking...
              </span>
            ) : isTTSPlaying ? (
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                🔊 AI Dermatologist speaking...
              </span>
            ) : isTTSPreparing ? (
              <span className="text-teal-300 animate-pulse font-extrabold flex items-center gap-1">
                ✦ Preparing spoken answer...
              </span>
            ) : (
              <span>Talk to your AI Dermatologist</span>
            )}
          </div>

          <div className="text-[10px] text-slate-400">
            {isListening
              ? "Listening to your spoken question in " + language
              : isTTSPlaying
              ? "Listen to your doctor's spoken response"
              : "Tap the microphone to speak your question"}
          </div>
        </div>

        {/* Big Prominent Voice Interaction Button */}
        <div className="flex items-center gap-2">
          {isTTSPlaying || isTTSPreparing ? (
            <button
              type="button"
              onClick={stopTTS}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Audio</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isProcessing}
              className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all ${
                isListening
                  ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30"
                  : isProcessing
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-400 text-slate-950 hover:scale-105 active:scale-95"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop Listening</span>
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 fill-current" />
                  <span>🎙️ TALK TO AI DERMATOLOGIST</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Preset Voice Triggers */}
      <div className="grid grid-cols-2 gap-1 shrink-0">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => processQuestion(q)}
            disabled={isProcessing || isListening}
            className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-teal-50 dark:bg-slate-800/90 text-teal-800 dark:text-teal-200 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-500 dark:hover:text-slate-950 transition text-left truncate border border-teal-200/80 dark:border-teal-800/80 flex items-center gap-1"
          >
            <span className="text-xs">🎙️</span>
            <span className="truncate">{q}</span>
          </button>
        ))}
      </div>

      {/* Optional Conversation Transcript Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-1.5 text-xs ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 text-[9px] mt-0.5">
                <Bot className="w-3 h-3" />
              </div>
            )}

            <div
              className={`p-2 rounded-xl max-w-[88%] space-y-1 ${
                msg.role === "user"
                  ? "bg-teal-600 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs"
              }`}
            >
              <div className="leading-relaxed text-[11px] whitespace-pre-line">{msg.content}</div>

              <div className="flex items-center justify-between text-[8px] opacity-70 border-t border-slate-200/40 dark:border-slate-700/40 pt-1 mt-1">
                <span>{msg.timestamp}</span>
                {msg.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => playTTS(null, language, msg.content)}
                    className="flex items-center gap-0.5 text-teal-600 dark:text-teal-300 hover:underline font-bold"
                  >
                    <Volume2 className="w-2.5 h-2.5" />
                    <span>Replay Voice</span>
                  </button>
                )}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 text-[9px] mt-0.5">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-1.5 items-center text-[11px] text-teal-600 dark:text-teal-400 p-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Consulting AI Dermatologist...</span>
          </div>
        )}
      </div>

      {/* Optional Quick Text Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputMsg.trim()) {
            processQuestion(inputMsg);
          }
        }}
        className="flex gap-1.5 pt-1 shrink-0"
      >
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type a question or use voice above..."}
          className="flex-1 p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
        />

        <button
          type="submit"
          disabled={!inputMsg.trim() || isProcessing}
          className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

