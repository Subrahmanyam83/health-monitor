"use client";

import { AnalysisResult, HealthLevel } from "@/types/alcohol";

const CONFIG: Record<HealthLevel, {
  label: string;
  emoji: string;
  gradient: string;
  glow: string;
  textColor: string;
  statsBg: string;
  description: string;
  tip: string;
}> = {
  low: {
    label: "LOW",
    emoji: "✅",
    gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    glow: "0 0 30px rgba(52, 211, 153, 0.3)",
    textColor: "#065f46",
    statsBg: "rgba(6, 95, 70, 0.07)",
    description: "You're within safe limits",
    tip: "Great discipline! Keep maintaining healthy habits.",
  },
  medium: {
    label: "MEDIUM",
    emoji: "⚠️",
    gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    glow: "0 0 30px rgba(245, 158, 11, 0.3)",
    textColor: "#92400e",
    statsBg: "rgba(146, 64, 14, 0.07)",
    description: "Moderate consumption detected",
    tip: "Consider reducing intake to stay in the safe zone.",
  },
  heavy: {
    label: "HEAVY",
    emoji: "🚨",
    gradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    glow: "0 0 30px rgba(239, 68, 68, 0.3)",
    textColor: "#991b1b",
    statsBg: "rgba(153, 27, 27, 0.07)",
    description: "High risk consumption",
    tip: "Strongly consider cutting back. Consult a doctor if needed.",
  },
};

export function HealthIndicator({ analysis }: { analysis: AnalysisResult }) {
  const cfg = CONFIG[analysis.level];

  const barWidth =
    analysis.level === "low"
      ? Math.min((analysis.weeklyAvgPureAlcohol / 100) * 33, 33)
      : analysis.level === "medium"
      ? 33 + Math.min(((analysis.weeklyAvgPureAlcohol - 100) / 100) * 33, 33)
      : Math.min(66 + ((analysis.weeklyAvgPureAlcohol - 200) / 200) * 34, 100);

  return (
    <div
      className="rounded-2xl p-5 animate-scale-in"
      style={{ background: cfg.gradient, boxShadow: cfg.glow }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cfg.emoji}</span>
            <span className="text-3xl font-black tracking-widest" style={{ color: cfg.textColor }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-sm font-semibold mt-1" style={{ color: cfg.textColor }}>
            {cfg.description}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: cfg.statsBg, color: cfg.textColor }}>
            {analysis.totalEntries} {analysis.totalEntries === 1 ? "entry" : "entries"}
          </span>
        </div>
      </div>

      {/* Risk bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1 font-medium" style={{ color: cfg.textColor }}>
          <span>Risk Level</span>
          <span>{Math.round(barWidth)}%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${barWidth}%`,
              background: analysis.level === "low"
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : analysis.level === "medium"
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #ef4444, #f87171)",
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 opacity-60" style={{ color: cfg.textColor }}>
          <span>Safe</span><span>Moderate</span><span>Heavy</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl p-3" style={{ background: cfg.statsBg }}>
          <span className="block text-xs font-medium opacity-70 mb-0.5" style={{ color: cfg.textColor }}>
            Weekly avg (pure alcohol)
          </span>
          <span className="text-xl font-bold" style={{ color: cfg.textColor }}>
            {analysis.weeklyAvgPureAlcohol} <span className="text-sm font-medium">ml</span>
          </span>
        </div>
        <div className="rounded-xl p-3" style={{ background: cfg.statsBg }}>
          <span className="block text-xs font-medium opacity-70 mb-0.5" style={{ color: cfg.textColor }}>
            Weekly avg (total)
          </span>
          <span className="text-xl font-bold" style={{ color: cfg.textColor }}>
            {analysis.weeklyAvgTotalMl} <span className="text-sm font-medium">ml</span>
          </span>
        </div>
      </div>

      {/* Tip */}
      <p className="text-xs rounded-xl px-3 py-2" style={{ background: cfg.statsBg, color: cfg.textColor }}>
        💡 {cfg.tip}
      </p>
      <p className="text-xs mt-2 opacity-50 text-center" style={{ color: cfg.textColor }}>
        Based on WHO: &lt;100ml/week = Low · 100–200ml = Medium · &gt;200ml = Heavy
      </p>
    </div>
  );
}
