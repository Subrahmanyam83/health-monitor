"use client";

import { useState } from "react";
import {
  FamilyMember,
  DailyLog as DailyLogType,
  Meal,
  MealType,
  FoodItem,
  sumMealCalories,
} from "@/lib/use-nutrition";
import { FoodSearch } from "./FoodSearch";
import { BurnSuggestions } from "./BurnSuggestions";

type Props = {
  member: FamilyMember;
  log: DailyLogType;
  onSave: (log: DailyLogType) => Promise<void>;
  onBack: () => void;
};

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "🌞",
  dinner: "🌙",
  snack: "🍎",
};

export function DailyLog({ member, log, onSave, onBack }: Props) {
  const [meals, setMeals] = useState<Meal[]>(log.meals);
  const [addingTo, setAddingTo] = useState<MealType | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [editingFood, setEditingFood] = useState<{ mealType: MealType; fdcId: string; portionGrams: string } | null>(null);

  const totalCalories = sumMealCalories(meals);

  function getMeal(type: MealType): Meal | undefined {
    return meals.find((m) => m.type === type);
  }

  function addFood(type: MealType, food: FoodItem) {
    setMeals((prev) => {
      const existing = prev.find((m) => m.type === type);
      if (existing) {
        return prev.map((m) =>
          m.type === type ? { ...m, foods: [...m.foods, food] } : m
        );
      }
      return [...prev, { id: crypto.randomUUID(), type, foods: [food] }];
    });
  }

  function updateFoodPortion(mealType: MealType, fdcId: string, newPortionGrams: number) {
    setMeals((prev) =>
      prev.map((m) =>
        m.type === mealType
          ? {
              ...m,
              foods: m.foods.map((f) => {
                if (f.fdcId !== fdcId) return f;
                const ratio = newPortionGrams / f.portionGrams;
                return {
                  ...f,
                  portionGrams: newPortionGrams,
                  calories: Math.round(f.calories * ratio),
                  proteinG: Math.round(f.proteinG * ratio * 10) / 10,
                  carbsG: Math.round(f.carbsG * ratio * 10) / 10,
                  fatG: Math.round(f.fatG * ratio * 10) / 10,
                };
              }),
            }
          : m
      )
    );
    setEditingFood(null);
  }

  function removeFood(mealType: MealType, fdcId: string) {
    setMeals((prev) =>
      prev
        .map((m) =>
          m.type === mealType ? { ...m, foods: m.foods.filter((f) => f.fdcId !== fdcId) } : m
        )
        .filter((m) => m.foods.length > 0)
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaveErr("");
    try {
      await onSave({ ...log, meals });
    } catch {
      setSaveErr("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 active:opacity-70 h-11 pr-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-400">{log.date}</p>
          <p className="text-sm font-semibold text-gray-800">{member.name}</p>
        </div>
      </div>

      {/* Total calories */}
      <div
        className="rounded-2xl p-4 text-white"
        style={{ background: "#16a34a" }}
      >
        <p className="text-xs opacity-80">Total calories today</p>
        <p className="text-3xl font-bold">{totalCalories} <span className="text-base font-normal opacity-80">kcal</span></p>
      </div>

      {/* Meals */}
      {MEAL_ORDER.map((mealType) => {
        const meal = getMeal(mealType);
        const mealCals = meal ? meal.foods.reduce((a, f) => a + f.calories, 0) : 0;
        return (
          <div key={mealType} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-base">{MEAL_EMOJI[mealType]}</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">{mealType}</span>
                {meal && (
                  <span className="text-xs text-gray-400">{mealCals} kcal</span>
                )}
              </div>
              <button
                onClick={() => setAddingTo(addingTo === mealType ? null : mealType)}
                className="h-8 px-3 rounded-lg text-xs font-medium active:scale-95 transition-all"
                style={{ background: "#f0fdf4", color: "#16a34a" }}
              >
                {addingTo === mealType ? "Close" : "+ Add food"}
              </button>
            </div>

            {addingTo === mealType && (
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <FoodSearch onAdd={(food) => { addFood(mealType, food); setAddingTo(null); }} />
              </div>
            )}

            {meal && meal.foods.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {meal.foods.map((food) => {
                  const isEditing = editingFood?.mealType === mealType && editingFood?.fdcId === food.fdcId;
                  return (
                    <div key={food.fdcId + food.portionGrams}>
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{food.name}</p>
                          <p className="text-xs text-gray-400">
                            {food.portionGrams}g · P {food.proteinG}g · C {food.carbsG}g · F {food.fatG}g
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 flex-shrink-0">{food.calories} kcal</span>
                        <button
                          onClick={() => setEditingFood(isEditing ? null : { mealType, fdcId: food.fdcId, portionGrams: String(food.portionGrams) })}
                          className="w-7 h-7 flex items-center justify-center text-gray-300 active:text-blue-400 flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeFood(mealType, food.fdcId)}
                          className="w-7 h-7 flex items-center justify-center text-gray-300 active:text-red-400 flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {isEditing && (
                        <div className="flex items-center gap-2 px-4 pb-3 bg-gray-50">
                          <span className="text-xs text-gray-500">Portion (g):</span>
                          <input
                            autoFocus
                            type="number"
                            value={editingFood.portionGrams}
                            onChange={(e) => setEditingFood({ ...editingFood, portionGrams: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const g = parseFloat(editingFood.portionGrams);
                                if (g > 0) updateFoodPortion(mealType, food.fdcId, g);
                              }
                              if (e.key === "Escape") setEditingFood(null);
                            }}
                            className="w-20 text-sm bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-green-400"
                            style={{ fontSize: "16px" }}
                          />
                          <button
                            onClick={() => {
                              const g = parseFloat(editingFood.portionGrams);
                              if (g > 0) updateFoodPortion(mealType, food.fdcId, g);
                            }}
                            className="text-xs bg-green-600 text-white rounded-lg px-3 py-1 font-medium"
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingFood(null)} className="text-xs text-gray-400">Cancel</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              !addingTo || addingTo !== mealType ? (
                <p className="text-xs text-gray-400 text-center py-3">Nothing logged yet</p>
              ) : null
            )}
          </div>
        );
      })}

      {/* Save button */}
      {saveErr && <p className="text-xs text-red-500 text-center">{saveErr}</p>}
      <button
        onClick={handleSave}
        disabled={saving || meals.length === 0}
        className="w-full h-12 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all"
        style={{ background: "#16a34a" }}
      >
        {saving ? "Saving…" : "Save Today's Log"}
      </button>

      {/* Burn suggestions */}
      {totalCalories > 0 && (
        <div className="pt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Burn Suggestions</p>
          <BurnSuggestions consumed={totalCalories} member={member} />
        </div>
      )}

      <div className="pb-8" />
    </div>
  );
}
