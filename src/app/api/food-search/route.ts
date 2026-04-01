import { NextRequest, NextResponse } from "next/server";

const USDA_API_KEY = process.env.USDA_API_KEY!;
const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    if (!USDA_API_KEY) {
      return NextResponse.json({ error: "USDA_API_KEY not configured" }, { status: 500 });
    }
    const res = await fetch(
      `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=15&api_key=${USDA_API_KEY}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: `USDA error: ${res.status}`, detail: body }, { status: 500 });
    }
    const json = await res.json();

    const foods = (json.foods ?? []).map((f: {
      fdcId: number;
      description: string;
      foodNutrients: { nutrientId: number; value: number }[];
    }) => {
      const get = (id: number) =>
        f.foodNutrients.find((n) => n.nutrientId === id)?.value ?? 0;
      return {
        fdcId: String(f.fdcId),
        name: f.description,
        // per 100g values from USDA
        caloriesPer100g: get(1008),
        proteinPer100g: get(1003),
        carbsPer100g: get(1005),
        fatPer100g: get(1004),
      };
    });

    return NextResponse.json({ foods });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Food search failed" }, { status: 500 });
  }
}
