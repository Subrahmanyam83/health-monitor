"use client";

import { useCallback, useEffect, useState } from "react";
import { EntryForm }        from "./EntryForm";
import { HealthIndicator }  from "./HealthIndicator";
import { ConsumptionChart } from "./ConsumptionChart";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { AlcoholEntry, AnalysisResult, DrinkType, DrinkUnit } from "@/types/alcohol";
import { ChartDataPoint } from "@/lib/alcohol-analysis";

const DRINK_TYPES: { value: DrinkType; label: string; unit: DrinkUnit }[] = [
  { value: "beer",   label: "Beer",   unit: "300ml" },
  { value: "whisky", label: "Whisky", unit: "peg"   },
  { value: "scotch", label: "Scotch", unit: "peg"   },
  { value: "rum",    label: "Rum",    unit: "peg"   },
  { value: "vodka",  label: "Vodka",  unit: "peg"   },
  { value: "gin",    label: "Gin",    unit: "peg"   },
  { value: "wine",   label: "Wine",   unit: "300ml" },
  { value: "other",  label: "Other",  unit: "peg"   },
];

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

function getToday() { return new Date().toISOString().split("T")[0]; }
function getDaysAgo(n: number) { return new Date(Date.now() - n * 864e5).toISOString().split("T")[0]; }

export function AlcoholTracker() {
  const [from, setFrom]       = useState("");
  const [to, setTo]           = useState("");
  const [active, setActive]   = useState("30d");
  const [data, setData]       = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ date: string; type: DrinkType; quantity: string }>({ date: "", type: "beer", quantity: "1" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFrom(getDaysAgo(30));
    setTo(getToday());
  }, []);

  const fetchData = useCallback(async () => {
    if (!from || !to) return;
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
    setTo(getToday());
  }

  function startEdit(e: AlcoholEntry) {
    setEditingId(e.id);
    setEditFields({ date: e.date, type: e.type, quantity: String(e.quantity) });
  }

  async function saveEdit(e: AlcoholEntry) {
    setSaving(true);
    const drinkType = DRINK_TYPES.find((d) => d.value === editFields.type)!;
    await fetch("/api/alcohol", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id, date: editFields.date, type: editFields.type, quantity: parseFloat(editFields.quantity), unit: drinkType.unit }),
    });
    setSaving(false);
    setEditingId(null);
    fetchData();
  }

  async function deleteEntry(id: string) {
    setSaving(true);
    await fetch(`/api/alcohol?id=${id}`, { method: "DELETE" });
    setSaving(false);
    setEditingId(null);
    fetchData();
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">From</label>
              <input type="date" value={from} max={to}
                onChange={(e) => { setFrom(e.target.value); setActive(""); }}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">To</label>
              <input type="date" value={to} min={from} max={getToday()}
                onChange={(e) => { setTo(e.target.value); setActive(""); }}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
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

          {/* Entry log — grouped by date */}
          {data.entries.length > 0 && (() => {
            // Group entries by date, newest first
            const grouped = [...data.entries].reverse().reduce<Record<string, AlcoholEntry[]>>(
              (acc, e) => { (acc[e.date] ??= []).push(e); return acc; }, {}
            );
            return (
              <CollapsibleSection
                title="Entry Log"
                defaultOpen={false}
                badge={`${data.entries.length}`}
              >
                <div className="pt-1 flex flex-col gap-3">
                  {Object.entries(grouped).map(([date, entries]) => (
                    <div key={date}>
                      {/* Date heading */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">{date}</span>
                        <div className="flex-1 h-px bg-indigo-100" />
                      </div>
                      {/* Entries under this date */}
                      <div className="flex flex-col divide-y divide-gray-50 pl-2">
                        {entries.map((e) =>
                          editingId === e.id ? (
                            <div key={e.id} className="py-3 flex flex-col gap-2 bg-gray-50 px-1 rounded-lg">
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="date"
                                  value={editFields.date}
                                  max={new Date().toISOString().split("T")[0]}
                                  onChange={(ev) => setEditFields((f) => ({ ...f, date: ev.target.value }))}
                                  className="col-span-2 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400"
                                  style={{ fontSize: "16px" }}
                                />
                                <input
                                  type="number"
                                  min="0.5"
                                  step="0.5"
                                  value={editFields.quantity}
                                  onChange={(ev) => setEditFields((f) => ({ ...f, quantity: ev.target.value }))}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400"
                                  style={{ fontSize: "16px" }}
                                />
                              </div>
                              <select
                                value={editFields.type}
                                onChange={(ev) => setEditFields((f) => ({ ...f, type: ev.target.value as DrinkType }))}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400"
                                style={{ fontSize: "16px" }}
                              >
                                {DRINK_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                              </select>
                              <div className="flex gap-2">
                                <button onClick={() => saveEdit(e)} disabled={saving}
                                  className="flex-1 text-xs bg-indigo-600 text-white rounded-lg py-1.5 font-medium disabled:opacity-50">Save</button>
                                <button onClick={() => deleteEntry(e.id)} disabled={saving}
                                  className="text-xs bg-red-50 text-red-500 rounded-lg px-3 py-1.5 font-medium disabled:opacity-50">Delete</button>
                                <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 px-2">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div key={e.id} className="flex items-center gap-2 py-2">
                              <div className="flex-1 grid grid-cols-2 gap-1">
                                <span className="text-xs font-medium text-gray-700">{DRINK_LABELS[e.type] ?? e.type}</span>
                                <span className="text-xs font-medium text-indigo-600">{e.totalMl} ml</span>
                              </div>
                              <button onClick={() => startEdit(e)} className="text-gray-300 hover:text-gray-500 p-1 flex-shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
                                </svg>
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            );
          })()}
        </>
      ) : null}
    </div>
  );
}
