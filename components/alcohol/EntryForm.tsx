"use client";

import { useState } from "react";
import { DrinkType, DrinkUnit } from "@/types/alcohol";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DRINK_TYPES: { value: DrinkType; label: string; emoji: string; unit: DrinkUnit; unitLabel: string }[] = [
  { value: "beer",   label: "Beer",   emoji: "🍺", unit: "300ml", unitLabel: "glasses (300ml each)" },
  { value: "whisky", label: "Whisky", emoji: "🥃", unit: "peg",   unitLabel: "pegs (30ml each)" },
  { value: "scotch", label: "Scotch", emoji: "🥃", unit: "peg",   unitLabel: "pegs (30ml each)" },
  { value: "rum",    label: "Rum",    emoji: "🍹", unit: "peg",   unitLabel: "pegs (30ml each)" },
  { value: "vodka",  label: "Vodka",  emoji: "🍸", unit: "peg",   unitLabel: "pegs (30ml each)" },
  { value: "gin",    label: "Gin",    emoji: "🍸", unit: "peg",   unitLabel: "pegs (30ml each)" },
  { value: "wine",   label: "Wine",   emoji: "🍷", unit: "300ml", unitLabel: "glasses (300ml each)" },
  { value: "other",  label: "Other",  emoji: "🥂", unit: "peg",   unitLabel: "pegs (30ml each)" },
];

interface Props {
  onAdded: () => void;
}

export function EntryForm({ onAdded }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate]         = useState(today);
  const [type, setType]         = useState<DrinkType>("beer");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const selected = DRINK_TYPES.find((d) => d.value === type)!;
  const totalMl  = parseFloat(quantity || "0") * (selected.unit === "300ml" ? 300 : 30);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const qty = parseFloat(quantity);
    if (!date || !type || isNaN(qty) || qty <= 0) {
      setError("Please fill all fields with valid values.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/alcohol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, type, quantity: qty, unit: selected.unit }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess(true);
      setQuantity("1");
      onAdded();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save entry. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-white/80 glass animate-fade-in-up">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-white/60" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))" }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🍻</span>
          <h2 className="font-semibold text-gray-800">Log a Drink</h2>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Record your alcohol consumption</p>
      </div>

      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Drink Type</label>
              <Select value={type} onValueChange={(v) => setType(v as DrinkType)}>
                <SelectTrigger className="w-full rounded-xl border-gray-200 bg-gray-50 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DRINK_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.emoji} {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Quantity <span className="text-gray-400 normal-case font-normal">({selected.unitLabel})</span>
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Preview */}
          {parseFloat(quantity) > 0 && (
            <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 rounded-xl px-4 py-2.5 animate-fade-in-up">
              <span className="text-base">{selected.emoji}</span>
              <span>
                <strong>{quantity}</strong> {selected.unit === "300ml" ? `glass${parseFloat(quantity) !== 1 ? "es" : ""}` : `peg${parseFloat(quantity) !== 1 ? "s" : ""}`} of {selected.label} = <strong>{totalMl} ml</strong>
              </span>
            </div>
          )}

          {error   && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 animate-fade-in-up">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2.5 animate-fade-in-up">✓ Entry saved successfully!</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-2.5 text-sm font-semibold rounded-xl text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            style={{ background: loading ? "#9ca3af" : "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: loading ? "none" : "0 4px 15px rgba(79,70,229,0.4)" }}
          >
            {loading ? "Saving..." : "Log Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}
