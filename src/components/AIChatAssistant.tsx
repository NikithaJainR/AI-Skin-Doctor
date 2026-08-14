import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, Loader2, Bot, User } from "lucide-react";
import { AssessmentReport, ChatMessage, LanguageCode } from "../types";

interface AIChatAssistantProps {
  report: AssessmentReport;
  language: LanguageCode;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  report,
  language,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: `Hello! I have loaded your assessment for **${report.possible_condition}**. Feel free to ask any follow-up questions regarding home care, active ingredients, sunscreen, or spreading risks.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const presetQuestions = [
    "Can I use Vitamin C or Hyaluronic acid on this?",
    "Will this condition spread to other parts of the body?",
    "Should I apply mineral sunscreen over this area?",
    "Is this condition fungal or bacterial in nature?",
    "Can children or pets catch this from me?",
    "Does stress or diet worsen this flare-up?",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");
    setIsLoading(true);

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

      const data = await response.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an issue answering that. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Interactive AI Skin Assistant
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ask follow-up questions tailored to your report context
          </p>
        </div>
      </div>

      {/* Preset Quick Question Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 transition text-left"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-3 rounded-2xl max-w-lg space-y-1 ${
                msg.role === "user"
                  ? "bg-teal-600 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm"
              }`}
            >
              <div className="leading-relaxed whitespace-pre-line">{msg.content}</div>
              <div className="text-[9px] opacity-60 text-right">{msg.timestamp}</div>
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 items-center text-xs text-teal-600 dark:text-teal-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI Assistant is analyzing your follow-up query...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!inputMsg.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
};
