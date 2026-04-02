"use client";

import { useState } from "react";
import {
  FamilyMember,
  DailyLog as DailyLogType,
  useNutrition,
  calcTDEE,
  sumMealCalories,
  getTodayDate,
} from "@/lib/use-nutrition";
import { MemberForm } from "./MemberForm";
import { DailyLog } from "./DailyLog";
import { MonthlyCaloriesChart } from "./MonthlyCaloriesChart";

type View =
  | { type: "home" }
  | { type: "add-member" }
  | { type: "edit-member"; member: FamilyMember }
  | { type: "daily-log"; member: FamilyMember; date: string };

export function NutritionHome() {
  const { data, loading, error, fetchData, addMember, updateMember, deleteMember, getOrCreateLog, saveLog } =
    useNutrition();
  const [view, setView] = useState<View>({ type: "home" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const today = getTodayDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-[#16a34a] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center space-y-2">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={fetchData} className="text-xs text-red-500 underline">Retry</button>
      </div>
    );
  }

  // ── Daily log view ──────────────────────────────────────────
  if (view.type === "daily-log") {
    const log = getOrCreateLog(view.member.id, view.date);
    return (
      <DailyLog
        member={view.member}
        log={log}
        date={view.date}
        onDateChange={(date) => setView({ ...view, date })}
        onSave={async (updated: DailyLogType) => {
          await saveLog(updated);
        }}
        onBack={() => setView({ type: "home" })}
      />
    );
  }

  // ── Add / edit member view ───────────────────────────────────
  if (view.type === "add-member" || view.type === "edit-member") {
    const isEdit = view.type === "edit-member";
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView({ type: "home" })}
            className="flex items-center gap-1.5 text-sm text-gray-500 active:opacity-70 h-11 pr-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="text-base font-semibold text-gray-800">{isEdit ? "Edit Member" : "Add Family Member"}</h2>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <MemberForm
            initial={isEdit ? view.member : undefined}
            onSave={async (m) => {
              if (isEdit && m.id) {
                await updateMember(m as FamilyMember);
              } else {
                await addMember(m as Omit<FamilyMember, "id">);
              }
              setView({ type: "home" });
            }}
            onCancel={() => setView({ type: "home" })}
          />
        </div>

        {isEdit && (
          <div className="bg-white rounded-2xl p-4 border border-red-50 shadow-sm">
            {confirmDelete === view.member.id ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">Remove {view.member.name} and all their logs?</p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await deleteMember(view.member.id);
                      setView({ type: "home" });
                    }}
                    className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-red-500 active:scale-95"
                  >
                    Yes, remove
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 h-10 rounded-xl text-sm text-gray-500 bg-gray-100 active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(view.member.id)}
                className="w-full h-10 rounded-xl text-sm font-medium text-red-500 active:scale-95"
              >
                Remove member
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Home view ────────────────────────────────────────────────
  const members = data?.members ?? [];

  return (
    <div className="space-y-4">
      {/* Today's date */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{new Date(today).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
        <button
          onClick={() => setView({ type: "add-member" })}
          className="h-9 px-3 rounded-xl text-xs font-semibold text-white active:scale-95 transition-all flex items-center gap-1.5"
          style={{ background: "#16a34a" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center space-y-3">
          <div className="text-4xl">👨‍👩‍👧‍👦</div>
          <p className="text-sm font-semibold text-gray-700">Add your first family member</p>
          <p className="text-xs text-gray-400">Track daily nutrition and calorie burn for each person.</p>
          <button
            onClick={() => setView({ type: "add-member" })}
            className="h-11 px-6 rounded-xl text-sm font-semibold text-white active:scale-95 transition-all"
            style={{ background: "#16a34a" }}
          >
            Add member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const log = getOrCreateLog(member.id, today);
            const consumed = sumMealCalories(log.meals);
            const tdee = calcTDEE(member);
            const pct = Math.min(100, Math.round((consumed / tdee) * 100));
            const over = consumed > tdee;

            return (
              <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 transition-colors"
                  onClick={() => setView({ type: "daily-log", member, date: today })}
                >
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                    style={{ background: "#16a34a" }}
                  >
                    {member.name[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold" style={{ color: over ? "#dc2626" : "#16a34a" }}>
                          {consumed} / {tdee} kcal
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setView({ type: "edit-member", member }); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg active:bg-gray-100 transition-colors flex-shrink-0"
                          title="Edit profile"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: over ? "#dc2626" : "#16a34a",
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {consumed === 0
                        ? "No food logged today"
                        : over
                        ? `${consumed - tdee} kcal over daily goal`
                        : `${tdee - consumed} kcal remaining`}
                    </p>
                  </div>
                </div>

                <div className="flex border-t border-gray-50">
                  <button
                    onClick={() => setView({ type: "daily-log", member, date: today })}
                    className="flex-1 py-2.5 text-xs font-medium text-center active:bg-gray-50 transition-colors"
                    style={{ color: "#16a34a" }}
                  >
                    Log food
                  </button>
                  <div className="w-px bg-gray-50" />
                  <button
                    onClick={() => setView({ type: "edit-member", member })}
                    className="flex-1 py-2.5 text-xs font-medium text-center text-gray-400 active:bg-gray-50 transition-colors"
                  >
                    Edit profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {members.length > 0 && data && (
        <MonthlyCaloriesChart members={members} logs={data.logs} />
      )}

      <div className="pb-8" />
    </div>
  );
}
