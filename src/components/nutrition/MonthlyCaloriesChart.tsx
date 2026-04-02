"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DailyLog, FamilyMember, sumMealCalories, calcTDEE } from "@/lib/use-nutrition";

type Props = {
  members: FamilyMember[];
  logs: DailyLog[];
};

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return options;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function MonthlyCaloriesChart({ members, logs }: Props) {
  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id ?? "");

  const { year, month } = monthOptions[selectedMonth];
  const daysInMonth = getDaysInMonth(year, month);
  const member = members.find((m) => m.id === selectedMemberId);
  const tdee = member ? calcTDEE(member) : 0;

  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const log = logs.find((l) => l.memberId === selectedMemberId && l.date === date);
    const calories = log ? sumMealCalories(log.meals) : 0;
    return { day, calories };
  });

  const today = new Date().toISOString().split("T")[0];
  const todayDay = new Date().getDate();
  const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() === month;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Monthly Calories</p>

      {/* Member selector */}
      {members.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className="flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium transition-all"
              style={{
                background: selectedMemberId === m.id ? "#16a34a" : "#f0fdf4",
                color: selectedMemberId === m.id ? "white" : "#16a34a",
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* Month selector */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-green-400 bg-white text-gray-600"
      >
        {monthOptions.map((o, i) => (
          <option key={i} value={i}>{o.label}</option>
        ))}
      </select>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={6} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f0fdf4" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const cal = payload[0].value as number;
              return (
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-md text-xs">
                  <p className="text-gray-500">Day {label}</p>
                  <p className="font-semibold text-gray-800">{cal} kcal</p>
                  {tdee > 0 && cal > 0 && (
                    <p style={{ color: cal > tdee ? "#dc2626" : "#16a34a" }}>
                      {cal > tdee ? `+${cal - tdee} over` : `${tdee - cal} under`} goal
                    </p>
                  )}
                </div>
              );
            }}
          />
          {tdee > 0 && (
            <Bar dataKey="calories" radius={[3, 3, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.calories === 0
                      ? "#e5e7eb"
                      : isCurrentMonth && entry.day > todayDay
                      ? "#e5e7eb"
                      : entry.calories > tdee
                      ? "#dc2626"
                      : "#16a34a"
                  }
                />
              ))}
            </Bar>
          )}
          {tdee === 0 && (
            <Bar dataKey="calories" radius={[3, 3, 0, 0]} fill="#16a34a" />
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#16a34a" }} />Within goal</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#dc2626" }} />Over goal</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#e5e7eb" }} />No data</span>
      </div>
    </div>
  );
}
