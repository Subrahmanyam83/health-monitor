"use client";

import { useState, useCallback, useRef } from "react";
import { FoodItem } from "@/lib/use-nutrition";

type UsdaResult = {
  fdcId: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

type Props = {
  onAdd: (food: FoodItem) => void;
};

const UNIT_TO_GRAMS = {
  g: 1,
  cup: 240,
  plate: 350,
  bowl: 300,
  glass: 240,
  tbsp: 15,
} as const;

type PortionUnit = keyof typeof UNIT_TO_GRAMS;

const UNIT_LABELS: Record<PortionUnit, string> = {
  g: "grams (g)",
  cup: "cup (~240g)",
  plate: "plate (~350g)",
  bowl: "bowl (~300g)",
  glass: "glass (~240g)",
  tbsp: "tablespoon (~15g)",
};

export function FoodSearch({ onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UsdaResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [selected, setSelected] = useState<UsdaResult | null>(null);
  const [portionAmount, setPortionAmount] = useState("1");
  const [portionUnit, setPortionUnit] = useState<PortionUnit>("g");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const portionGrams = Math.round(Number(portionAmount || 0) * UNIT_TO_GRAMS[portionUnit]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    setSearchErr("");
    try {
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Search failed");
      setResults(json.foods ?? []);
    } catch (e) {
      setSearchErr(e instanceof Error ? e.message : "Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  }, []);

  function handleQueryChange(val: string) {
    setQuery(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  }

  function selectFood(food: UsdaResult) {
    setSelected(food);
    setPortionAmount("1");
    setPortionUnit("g");
    setResults([]);
    setQuery(food.name);
  }

  function handleAdd() {
    if (!selected || portionGrams < 1) return;
    const factor = portionGrams / 100;
    onAdd({
      fdcId: selected.fdcId,
      name: selected.name,
      portionGrams,
      calories: Math.round(selected.caloriesPer100g * factor),
      proteinG: Math.round(selected.proteinPer100g * factor * 10) / 10,
      carbsG: Math.round(selected.carbsPer100g * factor * 10) / 10,
      fatG: Math.round(selected.fatPer100g * factor * 10) / 10,
    });
    setQuery("");
    setSelected(null);
    setPortionAmount("1");
    setPortionUnit("g");
    setResults([]);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search food (e.g. rice, chicken, dal)…"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:bg-white transition-all"
          style={{ fontSize: "16px" }}
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#16a34a] animate-spin" />
          </div>
        )}
      </div>

      {searchErr && <p className="text-xs text-red-500">{searchErr}</p>}

      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50 max-h-52 overflow-y-auto">
          {results.map((food) => (
            <button
              key={food.fdcId}
              type="button"
              onClick={() => selectFood(food)}
              className="w-full text-left px-3 py-2.5 active:bg-gray-50 transition-colors"
            >
              <p className="text-sm text-gray-800 leading-snug">{food.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {Math.round(food.caloriesPer100g)} kcal · {Math.round(food.proteinPer100g)}g protein per 100g
              </p>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && query.length >= 2 && !searching && !selected && (
        <p className="text-xs text-gray-400 text-center py-2">No results. Try a different name.</p>
      )}

      {selected && (
        <div className="bg-[#f0fdf4] rounded-xl p-3 space-y-3 border border-[#bbf7d0]">
          <p className="text-sm font-medium text-gray-800 leading-snug">{selected.name}</p>

          {/* Portion input */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500">Portion</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={portionAmount}
                onChange={(e) => setPortionAmount(e.target.value)}
                min="0.1"
                step="0.5"
                className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#16a34a] transition-all"
                style={{ fontSize: "16px" }}
              />
              <select
                value={portionUnit}
                onChange={(e) => setPortionUnit(e.target.value as PortionUnit)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#16a34a] transition-all"
                style={{ fontSize: "16px" }}
              >
                {(Object.keys(UNIT_LABELS) as PortionUnit[]).map((u) => (
                  <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                ))}
              </select>
            </div>
            {portionUnit !== "g" && (
              <p className="text-xs text-gray-400">
                = {portionGrams}g
              </p>
            )}
          </div>

          {/* Nutrition preview */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              {Math.round(selected.caloriesPer100g * portionGrams / 100)} kcal
            </span>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>P {Math.round(selected.proteinPer100g * portionGrams / 100 * 10) / 10}g</span>
              <span>C {Math.round(selected.carbsPer100g * portionGrams / 100 * 10) / 10}g</span>
              <span>F {Math.round(selected.fatPer100g * portionGrams / 100 * 10) / 10}g</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={portionGrams < 1}
            className="w-full h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all"
            style={{ background: "#16a34a" }}
          >
            Add to Meal
          </button>
        </div>
      )}
    </div>
  );
}
