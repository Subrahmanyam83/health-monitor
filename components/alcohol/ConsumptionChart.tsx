"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { ChartDataPoint } from "@/lib/alcohol-analysis";

interface Props {
  data: ChartDataPoint[];
}

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl shadow-lg px-4 py-3 text-sm border border-white/80">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-gray-600">
          {p.name === "totalMl" ? "Total Volume" : "Pure Alcohol"}:{" "}
          <span className="font-semibold text-indigo-700">{p.value} ml</span>
        </p>
      ))}
    </div>
  );
}

export function ConsumptionChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl glass border border-white/80 shadow-sm animate-fade-in-up stagger-3">
        <div className="px-5 py-4 border-b border-white/60" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))" }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h2 className="font-semibold text-gray-800">Consumption Over Time</h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-44 text-gray-400 gap-2">
          <span className="text-3xl">🫙</span>
          <span className="text-sm">No data for selected range</span>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, date: formatDate(d.date) }));

  return (
    <div className="rounded-2xl glass border border-white/80 shadow-sm animate-fade-in-up stagger-3">
      <div className="px-5 py-4 border-b border-white/60" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))" }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h2 className="font-semibold text-gray-800">Consumption Over Time</h2>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{data.length} day{data.length !== 1 ? "s" : ""} with entries</p>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={3}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="pureGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} unit="ml" axisLine={false} tickLine={false} width={48} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }} />
            <Legend
              formatter={(value) => (
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {value === "totalMl" ? "Total Volume (ml)" : "Pure Alcohol (ml)"}
                </span>
              )}
            />
            <Bar dataKey="totalMl" fill="url(#totalGrad)" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((_, i) => <Cell key={i} />)}
            </Bar>
            <Bar dataKey="pureAlcohol" fill="url(#pureGrad)" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((_, i) => <Cell key={i} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
