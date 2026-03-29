"use client";

import { useCallback, useEffect, useState } from "react";
import { EntryForm }        from "./EntryForm";
import { HealthIndicator }  from "./HealthIndicator";
import { ConsumptionChart } from "./ConsumptionChart";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { AlcoholEntry, AnalysisResult } from "@/types/alcohol";
import { ChartDataPoint } from "@/lib/alcohol-analysis";

interface ApiResponse {
  entries:    AlcoholEntry[];
  analysis:   AnalysisResult;
  chartData:  ChartDataPoint[];
}

const DRINK_LABELS: Record<string, string> = {
  beer: "Beer", whisky: "Whisky", scotch: "Scotch",
  rum: "Rum", vodka: "Vodka", gin: "Gin", wine: "Wine", other: "Other",
};

const PRESETS = [
  { label: "7d",  days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 3650 },
];

export function AlcoholTracker() {
  const today     = new Date().toISOString().split("T")[0];
  const thirtyAgo = new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0];

  const [from, setFrom]       = useState(thirtyAgo);
  const [to, setTo]           = useState(today);
  const [active, setActive]   = useState("30d");
  const [data, setData]       = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/alcohol?from=${from}&to=${to}`);
      if (!res.ok) throw new Error();
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
    <div className="space-y-3">
      {/* Log entry */}
      <EntryForm onAdded={fetchData} />

      {/* Date range */}
      <CollapsibleSection title="Date Range" defaultOpen={true}>
        <div className="space-y-3 pt-1">
          <div className="flex gap-2">
            {PRESETS.map(({ label, days }) => (
              <button
                key={label}
                onClick={() => applyPreset(label, days)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-150 active:scale-95"
                style={
                  active === label
                    ? { background: "#4f46e5", color: "#fff" }
                    : { background: "#f1f5f9", color: "#64748b" }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">From</label>
              <input type="date" value={from} max={to}
                onChange={(e) => { setFrom(e.target.value); setActive(""); }}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">To</label>
              <input type="date" value={to} min={from} max={today}
                onChange={(e) => { setTo(e.target.value); setActive(""); }}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-lg border border-red-100">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
        </div>
      ) : data ? (
        <>
          <HealthIndicator analysis={data.analysis} />
          <ConsumptionChart data={data.chartData} />

          {/* Entry log */}
          {data.entries.length > 0 && (
            <CollapsibleSection
              title="Entry Log"
              defaultOpen={false}
              badge={`${data.entries.length}`}
            >
              <div className="overflow-x-auto -mx-1 pt-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Date", "Type", "Qty", "Total"].map((h) => (
                        <th key={h} className="pb-2 pr-4 text-left text-xs font-medium text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.entries].reverse().map((e) => (
                      <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 pr-4 text-xs text-gray-500">{e.date}</td>
                        <td className="py-2.5 pr-4 text-xs font-medium text-gray-700">{DRINK_LABELS[e.type] ?? e.type}</td>
                        <td className="py-2.5 pr-4 text-xs text-gray-500">
                          {e.quantity} {e.unit === "peg" ? "peg" : "glass"}
                        </td>
                        <td className="py-2.5 text-xs font-medium text-indigo-600">{e.totalMl} ml</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>
          )}
        </>
      ) : null}
    </div>
  );
}
