export type DrinkType = "beer" | "whisky" | "scotch" | "rum" | "vodka" | "gin" | "wine" | "other";

export type DrinkUnit = "300ml" | "peg";

export interface AlcoholEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  type: DrinkType;
  quantity: number;
  unit: DrinkUnit;
  totalMl: number;    // pre-computed total volume in ml
}

export interface AlcoholData {
  entries: AlcoholEntry[];
}

export type HealthLevel = "low" | "medium" | "heavy";

export interface AnalysisResult {
  level: HealthLevel;
  weeklyAvgPureAlcohol: number;   // ml
  weeklyAvgTotalMl: number;
  totalEntries: number;
  dateRange: { from: string; to: string };
}
