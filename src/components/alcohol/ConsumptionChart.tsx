"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ChartDataPoint } from "@/lib/alcohol-analysis";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

interface Props { data: ChartDataPoint[] }

function fmt(d: string) {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-gray-500">
          {p.name === "totalMl" ? "Total" : "Pure alcohol"}:{" "}
          <span className="font-semibold text-indigo-600">{p.value} ml</span>
        </p>
      ))}
    </div>
  );
}

export function ConsumptionChart({ data }: Props) {
  const chartData = data.map((d) => ({ ...d, date: fmt(d.date) }));

  return (
    <CollapsibleSection title="Consumption Chart" defaultOpen={true} badge={`${data.length}d`}>
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-gray-300 text-sm gap-2">
          <span className="text-2xl">—</span>
          No data for this range
        </div>
      ) : (
        <div className="pt-1">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 8, bottom: 0 }} barGap={2}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} unit="ml" axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)", radius: 4 }} />
              <Bar dataKey="totalMl"    name="totalMl"    fill="url(#g1)" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {chartData.map((_, i) => <Cell key={i} />)}
              </Bar>
              <Bar dataKey="pureAlcohol" name="pureAlcohol" fill="url(#g2)" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {chartData.map((_, i) => <Cell key={i} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-1.5 rounded-full bg-indigo-500 inline-block" />Total volume
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-1.5 rounded-full bg-violet-400 inline-block" />Pure alcohol
            </div>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}
