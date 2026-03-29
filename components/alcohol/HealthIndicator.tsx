"use client";

import { AnalysisResult, HealthLevel } from "@/types/alcohol";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

const CONFIG: Record<HealthLevel, {
  label: string;
  color: string;
  dot: string;
  tip: string;
}> = {
  low:    { label: "Low",    color: "text-emerald-700", dot: "bg-emerald-500", tip: "Within safe limits." },
  medium: { label: "Medium", color: "text-amber-700",   dot: "bg-amber-400",   tip: "Consider reducing intake." },
  heavy:  { label: "Heavy",  color: "text-red-700",     dot: "bg-red-500",     tip: "High risk — consult a doctor if needed." },
};

const BAR_COLORS: Record<HealthLevel, string> = {
  low:    "#10b981",
  medium: "#f59e0b",
  heavy:  "#ef4444",
};

export function HealthIndicator({ analysis }: { analysis: AnalysisResult }) {
  const cfg = CONFIG[analysis.level];

  const pct = Math.min(
    analysis.level === "low"    ? (analysis.weeklyAvgPureAlcohol / 100) * 33 :
    analysis.level === "medium" ? 33 + ((analysis.weeklyAvgPureAlcohol - 100) / 100) * 33 :
                                  66 + Math.min(((analysis.weeklyAvgPureAlcohol - 200) / 200) * 34, 34),
    100
  );

  return (
    <CollapsibleSection title="Health Analysis" defaultOpen={true} badge={analysis.level.charAt(0).toUpperCase() + analysis.level.slice(1)}>
      <div className="space-y-4 pt-1">
        {/* Level */}
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <span className={`text-2xl font-bold tracking-tight ${cfg.color}`}>{cfg.label}</span>
          <span className="text-sm text-gray-400">consumption</span>
        </div>

        {/* Risk bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Safe</span><span>Moderate</span><span>Heavy</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, backgroundColor: BAR_COLORS[analysis.level] }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Weekly avg</p>
            <p className="font-semibold text-gray-800">{analysis.weeklyAvgPureAlcohol} ml pure alcohol</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Entries</p>
            <p className="font-semibold text-gray-800">{analysis.totalEntries}</p>
          </div>
        </div>

        {/* Tip */}
        <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{cfg.tip}</p>
      </div>
    </CollapsibleSection>
  );
}
