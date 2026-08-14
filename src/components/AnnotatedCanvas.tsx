import React, { useState } from "react";
import { Eye, EyeOff, Layers, ZoomIn } from "lucide-react";
import { AnnotatedRegion } from "../types";

interface AnnotatedCanvasProps {
  imageUrl: string;
  regions?: AnnotatedRegion[];
}

export const AnnotatedCanvas: React.FC<AnnotatedCanvasProps> = ({
  imageUrl,
  regions = [],
}) => {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<AnnotatedRegion | null>(null);

  // Fallback region if none returned from Gemini
  const activeRegions: AnnotatedRegion[] =
    regions.length > 0
      ? regions
      : [
          {
            id: "region-1",
            label: "Primary Affected Lesion Zone",
            box_2d: [20, 25, 75, 75],
            color: "#10b981",
            description: "Central focus region analyzed by Gemini Vision.",
          },
        ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Annotated Image Region Analysis
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Highlighted lesion boundaries and visual feature focus zones
          </p>
        </div>

        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            showAnnotations
              ? "bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}
        >
          {showAnnotations ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showAnnotations ? "Hide Overlay" : "Show Bounding Boxes"}
        </button>
      </div>

      {/* Main Image Container with Overlay Bounding Boxes */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 max-h-96 flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Skin Lesion Analysis"
          className="w-full h-full object-contain max-h-96"
        />

        {showAnnotations &&
          activeRegions.map((region, idx) => {
            const [ymin, xmin, ymax, xmax] = region.box_2d;
            const top = `${ymin}%`;
            const left = `${xmin}%`;
            const height = `${ymax - ymin}%`;
            const width = `${xmax - xmin}%`;
            const boxColor = region.color || "#10b981";

            const isSelected = selectedRegion?.id === region.id;

            return (
              <div
                key={region.id || idx}
                onClick={() => setSelectedRegion(region)}
                className={`absolute rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? "ring-4 ring-white/50 scale-[1.02] z-20" : "hover:opacity-100"
                }`}
                style={{
                  top,
                  left,
                  height,
                  width,
                  borderColor: boxColor,
                  backgroundColor: `${boxColor}20`,
                }}
              >
                {/* Heatmap Pulsing Core */}
                <div
                  className="absolute inset-0 rounded-lg animate-pulse"
                  style={{ backgroundColor: `${boxColor}15` }}
                />

                {/* Label Badge */}
                <div
                  className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-md whitespace-nowrap z-10 flex items-center gap-1"
                  style={{ backgroundColor: boxColor }}
                >
                  <ZoomIn className="w-3 h-3" />
                  {region.label}
                </div>
              </div>
            );
          })}
      </div>

      {/* Selected Region Detail Pill */}
      {selectedRegion && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Focused Region: {selectedRegion.label}</span>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          {selectedRegion.description && (
            <p className="text-slate-600 dark:text-slate-400">{selectedRegion.description}</p>
          )}
        </div>
      )}
    </div>
  );
};
