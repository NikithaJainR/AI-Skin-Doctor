import React from "react";
import { AlertTriangle, ShieldCheck, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";
import { SeverityLevel } from "../types";

interface RiskMeterGaugeProps {
  severity: SeverityLevel;
  confidenceScore: number;
}

export const RiskMeterGauge: React.FC<RiskMeterGaugeProps> = ({
  severity = "low",
  confidenceScore = 80,
}) => {
  const getSeverityConfig = (s: SeverityLevel | string) => {
    switch (s.toLowerCase()) {
      case "low":
        return {
          label: "Low Risk",
          color: "#10b981", // Emerald
          bg: "bg-emerald-50 dark:bg-emerald-950/60",
          border: "border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-700 dark:text-emerald-300",
          icon: ShieldCheck,
          desc: "Unlikely to pose urgent threat. Gentle home care & observation advised.",
          angle: 25,
        };
      case "moderate":
        return {
          label: "Moderate Risk",
          color: "#f59e0b", // Amber
          bg: "bg-amber-50 dark:bg-amber-950/60",
          border: "border-amber-200 dark:border-amber-800",
          text: "text-amber-700 dark:text-amber-300",
          icon: Activity,
          desc: "Symptomatic skin condition. Monitor closely and schedule non-urgent doctor consult.",
          angle: 75,
        };
      case "high":
        return {
          label: "High Risk",
          color: "#f97316", // Orange
          bg: "bg-orange-50 dark:bg-orange-950/60",
          border: "border-orange-200 dark:border-orange-800",
          text: "text-orange-700 dark:text-orange-300",
          icon: AlertTriangle,
          desc: "Potential dermatological flare-up or spreading lesion. Prompt doctor evaluation recommended.",
          angle: 125,
        };
      case "urgent":
        return {
          label: "Urgent Red Flag",
          color: "#ef4444", // Red
          bg: "bg-rose-50 dark:bg-rose-950/60",
          border: "border-rose-200 dark:border-rose-800",
          text: "text-rose-700 dark:text-rose-300",
          icon: ShieldAlert,
          desc: "Urgent red flags detected. Please seek immediate professional medical attention.",
          angle: 160,
        };
      default:
        return {
          label: "Low Risk",
          color: "#10b981",
          bg: "bg-emerald-50 dark:bg-emerald-950/60",
          border: "border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-700 dark:text-emerald-300",
          icon: ShieldCheck,
          desc: "Unlikely to pose urgent threat.",
          angle: 25,
        };
    }
  };

  const cfg = getSeverityConfig(severity);
  const IconComponent = cfg.icon;

  return (
    <div className={`p-6 rounded-2xl ${cfg.bg} border ${cfg.border} shadow-sm space-y-6 transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${cfg.text}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-extrabold ${cfg.text}`}>{cfg.label} Assessment</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{cfg.desc}</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="text-right">
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {confidenceScore}%
          </div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            AI Confidence
          </div>
        </div>
      </div>

      {/* SVG Arc Gauge Bar */}
      <div className="relative pt-2">
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div className="w-1/4 bg-emerald-500" title="Low" />
          <div className="w-1/4 bg-amber-400" title="Moderate" />
          <div className="w-1/4 bg-orange-500" title="High" />
          <div className="w-1/4 bg-rose-600" title="Urgent" />
        </div>

        {/* Needle Marker */}
        <div
          className="absolute -top-1 transition-all duration-700 transform -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${(cfg.angle / 180) * 100}%` }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-md"
            style={{ backgroundColor: cfg.color }}
          />
          <div className="w-0.5 h-3 bg-slate-800 dark:bg-white" />
        </div>
      </div>
    </div>
  );
};
