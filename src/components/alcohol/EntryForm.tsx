"use client";

import { useEffect, useState } from "react";
import { DrinkType, DrinkUnit } from "@/types/alcohol";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

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

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function EntryForm({ onAdded }: { onAdded: () => void }) {
  const [date, setDate]         = useState("");
  const [type, setType]         = useState<DrinkType>("beer");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState<"idle" | "success" | "error">("idle");

  useEffect(() => { setDate(getToday()); }, []);

  const selected  = DRINK_TYPES.find((d) => d.value === type)!;
  const unitSize  = selected.unit === "300ml" ? 300 : 30;
  const totalMl   = Math.round(parseFloat(quantity || "0") * unitSize);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!date || isNaN(qty) || qty <= 0) return;

    setLoading(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/alcohol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, type, quantity: qty, unit: selected.unit }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setQuantity("1");
      onAdded();
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CollapsibleSection title="Log a Drink" defaultOpen={true}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-[1fr_1fr_64px] gap-2 items-start">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">Date</label>
            <input
              type="date" value={date} max={getToday()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
              style={{ fontSize: "16px" }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">Drink</label>
            <Select value={type} onValueChange={(v) => setType(v as DrinkType)}>
              <SelectTrigger className="w-full rounded-lg border-gray-200 bg-gray-50 h-7 text-xs px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DRINK_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">Qty</label>
            <input
              type="number" min="0.5" step="0.5" value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {totalMl > 0 ? `≈ ${totalMl} ml · ${selected.unit === "300ml" ? "glasses" : "pegs"}` : ""}
          </p>
          <div className="flex items-center gap-2">
            {status === "success" && <span className="text-xs text-emerald-600 font-medium">Saved</span>}
            {status === "error"   && <span className="text-xs text-red-500 font-medium">Failed</span>}
            <button
              type="submit" disabled={loading}
              className="px-4 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-all active:scale-95"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </CollapsibleSection>
  );
}
