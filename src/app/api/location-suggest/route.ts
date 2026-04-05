import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&featuretype=city`,
      { headers: { "User-Agent": "SunakshiniMiniApps/1.0" }, cache: "no-store" }
    );
    const json = await res.json();
    const results: string[] = [];
    for (const item of json) {
      const a = item.address ?? {};
      const parts = [
        a.city || a.town || a.village || a.county,
        a.state,
        a.country,
      ].filter(Boolean);
      const label = parts.join(", ");
      if (label && !results.includes(label)) results.push(label);
    }
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
