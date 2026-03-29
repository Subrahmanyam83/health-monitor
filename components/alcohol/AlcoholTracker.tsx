"use client";

import { useCallback, useEffect, useState } from "react";
import { EntryForm }        from "./EntryForm";
import { HealthIndicator }  from "./HealthIndicator";
import { ConsumptionChart } from "./ConsumptionChart";
import { AlcoholEntry, AnalysisResult } from "@/types/alcohol";
import { ChartDataPoint } from "@/lib/alcohol-analysis";

interface ApiResponse {
  entries:    AlcoholEntry[];
  analysis:   AnalysisResult;
  chartData:  ChartDataPoint[];
  allEntries: AlcoholEntry[];
}

const DRINK_LABELS: Record<string, { label: string; emoji: string }> = {
  beer:   { label: "Beer",   emoji: "🍺" },
  whisky: { label: "Whisky", emoji: "🥃" },
  scotch: { label: "Scotch", emoji: "🥃" },
  rum:    { label: "Rum",    emoji: "🍹" },
  vodka:  { label: "Vodka",  emoji: "🍸" },
  gin:    { label: "Gin",    emoji: "🍸" },
  wine:   { label: "Wine",   emoji: "🍷" },
  other:  { label: "Other",  emoji: "🥂" },
};

const PRESETS = [
  { label: "7d",     days: 7 },
  { label: "30d",    days: 30 },
  { label: "90d",    days: 90 },
  { label: "All",    days: 3650 },
];

export function AlcoholTracker() {
  const today         = new Date().toISOString().split("T")[0];
  const thirtyAgo     = new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0];
  const [from, setFrom]   = useState(thirtyAgo);
  const [to, setTo]       = useState(today);
  const [active, setActive] = useState("30d");
  const [data, setData]   = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/alcohol?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setError("Failed to load data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function applyPreset(label: string, days: number) {
    setActive(label);
    setFrom(new Date(Date.now() - days * 864e5).toISOString().split("T")[0]);
    setTo(today);
  }

  return (
    <div className="space-y-5">
      {/* Entry Form */}
      <EntryForm onAdded={fetchData} />

      {/* Date Range Filter */}
      <div className="rounded-2xl glass border border-white/80 shadow-sm animate-fade-in-up stagger-1">
        <div className="px-5 py-4 border-b border-white/60" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))" }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h2 className="font-semibold text-gray-800">Analysis Period</h2>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {/* Quick presets */}
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map(({ label, days }) => (
              <button
                key={label}
                onClick={() => applyPreset(label, days)}
                className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 active:scale-95"
                style={
                  active === label
                    ? { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", boxShadow: "0 3px 10px rgba(79,70,229,0.35)" }
                    : { background: "rgba(99,102,241,0.08)", color: "#4f46e5" }
                }
              >
                {label}
              </button>
            ))}
          </div>
          {/* Custom range */}
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">From</label>
              <input
                type="date" value={from} max={to}
                onChange={(e) => { setFrom(e.target.value); setActive(""); }}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">To</label>
              <input
                type="date" value={to} min={from} max={today}
                onChange={(e) => { setTo(e.target.value); setActive(""); }}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 animate-fade-in-up">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in-up">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <span className="text-sm text-gray-400">Loading your data...</span>
        </div>
      ) : data ? (
        <>
          {/* Health Indicator */}
          <div className="animate-fade-in-up stagger-2">
            <HealthIndicator analysis={data.analysis} />
          </div>

          {/* Chart */}
          <ConsumptionChart data={data.chartData} />

          {/* Entry Log */}
          {data.entries.length > 0 && (
            <div className="rounded-2xl glass border border-white/80 shadow-sm animate-fade-in-up stagger-4">
              <div className="px-5 py-4 border-b border-white/60" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <h2 className="font-semibold text-gray-800">Entry Log</h2>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.1)", color: "#4f46e5" }}>
                    {data.entries.length} entries
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Qty</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.entries].reverse().map((e, i) => {
                      const d = DRINK_LABELS[e.type] ?? { label: e.type, emoji: "🥂" };
                      return (
                        <tr
                          key={e.id}
                          className="border-b border-gray-50 hover:bg-indigo-50/50 transition-colors animate-row-in"
                          style={{ animationDelay: `${i * 0.04}s` }}
                        >
                          <td className="px-5 py-3 text-gray-500 font-medium">{e.date}</td>
                          <td className="px-5 py-3 font-semibold text-gray-700">
                            {d.emoji} {d.label}
                          </td>
                          <td className="px-5 py-3 text-gray-500">
                            {e.quantity} {e.unit === "peg" ? `peg${e.quantity !== 1 ? "s" : ""}` : "glass"}
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(99,102,241,0.1)", color: "#4f46e5" }}>
                              {e.totalMl} ml
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
