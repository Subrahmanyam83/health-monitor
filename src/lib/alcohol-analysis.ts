import { AlcoholEntry, AnalysisResult, HealthLevel } from "@/types/alcohol";

// Average ABV assumptions for pure alcohol calculation
const ABV: Record<string, number> = {
  beer: 0.05,
  wine: 0.12,
  whisky: 0.40,
  scotch: 0.40,
  rum: 0.40,
  vodka: 0.40,
  gin: 0.40,
  other: 0.40,
};

// Weekly pure alcohol thresholds (ml of pure alcohol)
// ~100ml/week ≈ 10 standard drinks (WHO low-risk guideline)
const THRESHOLDS = {
  low: 100,    // < 100ml/week pure alcohol → LOW
  medium: 200, // 100–200ml/week → MEDIUM
  // > 200ml/week → HEAVY
};

export function getPureAlcohol(entry: AlcoholEntry): number {
  const abv = ABV[entry.type] ?? 0.40;
  return entry.totalMl * abv;
}

export function filterByDateRange(
  entries: AlcoholEntry[],
  from: string,
  to: string
): AlcoholEntry[] {
  return entries.filter((e) => e.date >= from && e.date <= to);
}

export function getHealthLevel(weeklyAvgPureAlcohol: number): HealthLevel {
  if (weeklyAvgPureAlcohol < THRESHOLDS.low) return "low";
  if (weeklyAvgPureAlcohol < THRESHOLDS.medium) return "medium";
  return "heavy";
}

export function analyzeEntries(
  entries: AlcoholEntry[],
  from: string,
  to: string
): AnalysisResult {
  const filtered = filterByDateRange(entries, from, to);

  if (filtered.length === 0) {
    return {
      level: "low",
      weeklyAvgPureAlcohol: 0,
      weeklyAvgTotalMl: 0,
      totalEntries: 0,
      dateRange: { from, to },
    };
  }

  const totalPureAlcohol = filtered.reduce((sum, e) => sum + getPureAlcohol(e), 0);
  const totalMl = filtered.reduce((sum, e) => sum + e.totalMl, 0);

  // Calculate number of weeks in range
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const daysDiff = Math.max(1, (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24) + 1);
  const weeks = daysDiff / 7;

  const weeklyAvgPureAlcohol = totalPureAlcohol / weeks;
  const weeklyAvgTotalMl = totalMl / weeks;

  return {
    level: getHealthLevel(weeklyAvgPureAlcohol),
    weeklyAvgPureAlcohol: Math.round(weeklyAvgPureAlcohol * 10) / 10,
    weeklyAvgTotalMl: Math.round(weeklyAvgTotalMl),
    totalEntries: filtered.length,
    dateRange: { from, to },
  };
}

export interface ChartDataPoint {
  date: string;
  totalMl: number;
  pureAlcohol: number;
  drinks: number;
}

export function groupByDate(entries: AlcoholEntry[]): ChartDataPoint[] {
  const map = new Map<string, ChartDataPoint>();

  for (const entry of entries) {
    const existing = map.get(entry.date);
    if (existing) {
      existing.totalMl += entry.totalMl;
      existing.pureAlcohol += Math.round(getPureAlcohol(entry) * 10) / 10;
      existing.drinks += 1;
    } else {
      map.set(entry.date, {
        date: entry.date,
        totalMl: entry.totalMl,
        pureAlcohol: Math.round(getPureAlcohol(entry) * 10) / 10,
        drinks: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
