"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/lib/alcohol-analysis";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

interface Props { data: ChartDataPoint[] }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(d: string) {
  const [, m, day] = d.split("-");
  return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(day, 10)}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-gray-500">
        <span className="font-semibold text-indigo-600">{payload[0].value} ml</span>
      </p>
    </div>
  );
}

export function ConsumptionChart({ data }: Props) {
  const chartData = data.map((d) => ({ date: fmt(d.date), ml: d.totalMl }));

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
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} unit="ml" axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)", radius: 4 }} />
              <Bar dataKey="ml" fill="url(#g1)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CollapsibleSection>
  );
}
