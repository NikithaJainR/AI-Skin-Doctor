import React, { useState, useEffect } from "react";
import { History, Search, Filter, Trash2, Download, Eye, FileText } from "lucide-react";
import { AssessmentReport, SeverityLevel } from "../types";
import { getSavedReports, deleteReport } from "../utils/storage";
import { generateReportPDF } from "../utils/pdfGenerator";

interface HistoryPageProps {
  onSelectReport: (report: AssessmentReport) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectReport }) => {
  const [reports, setReports] = useState<AssessmentReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  useEffect(() => {
    setReports(getSavedReports());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteReport(id);
    setReports(getSavedReports());
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.possible_condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === "all" || r.severity.toLowerCase() === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  const exportAllJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AI_Skin_Doctor_History_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Saved Reports History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All reports are stored locally in your browser memory for total privacy.
          </p>
        </div>

        {reports.length > 0 && (
          <button
            onClick={exportAllJSON}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 hover:bg-slate-200 transition"
          >
            <Download className="w-4 h-4" />
            Export JSON Backup
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports by condition name or text..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {["all", "low", "moderate", "high", "urgent"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition ${
                selectedSeverity === sev
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold">No saved reports found.</p>
          <p className="text-xs">Run a diagnosis to create and store assessment reports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const badgeColor =
              report.severity === "low"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                : report.severity === "moderate"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                : report.severity === "high"
                ? "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300";

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition shadow-sm cursor-pointer space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {report.primaryImage && (
                      <img
                        src={report.primaryImage}
                        alt="Primary"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {report.possible_condition}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeColor}`}>
                    {report.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {report.summary}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> View Assessment
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateReportPDF(report);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(report.id, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 transition"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
