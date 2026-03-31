import { NextRequest, NextResponse } from "next/server";
import { getFile, updateFile } from "@/lib/github";
import { analyzeEntries, filterByDateRange, groupByDate } from "@/lib/alcohol-analysis";
import { AlcoholData, AlcoholEntry, DrinkType, DrinkUnit } from "@/types/alcohol";

const DATA_PATH = "data/alcohol.json";

const UNIT_ML: Record<DrinkUnit, number> = {
  "300ml": 300,
  peg: 30,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const { content } = await getFile(DATA_PATH);
    const data: AlcoholData = JSON.parse(content);

    const allEntries = data.entries;

    // Default range: all time
    const earliest = allEntries.length > 0 ? allEntries.map((e) => e.date).sort()[0] : new Date().toISOString().split("T")[0];
    const latest = new Date().toISOString().split("T")[0];

    const rangeFrom = from ?? earliest;
    const rangeTo = to ?? latest;

    const filtered = filterByDateRange(allEntries, rangeFrom, rangeTo);
    const analysis = analyzeEntries(allEntries, rangeFrom, rangeTo);
    const chartData = groupByDate(filtered);

    return NextResponse.json({ entries: filtered, analysis, chartData, allEntries });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, type, quantity, unit } = body as {
      date: string;
      type: DrinkType;
      quantity: number;
      unit: DrinkUnit;
    };

    if (!date || !type || !quantity || !unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalMl = quantity * UNIT_ML[unit];

    const newEntry: AlcoholEntry = {
      id: new Date().toISOString(),
      date,
      type,
      quantity: Number(quantity),
      unit,
      totalMl,
    };

    const { content, sha } = await getFile(DATA_PATH);
    const data: AlcoholData = JSON.parse(content);
    data.entries.push(newEntry);
    data.entries.sort((a, b) => a.date.localeCompare(b.date));

    await updateFile(
      DATA_PATH,
      JSON.stringify(data, null, 2) + "\n",
      sha,
      `Add ${type} entry for ${date}`
    );

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, date, type, quantity, unit } = body as {
      id: string;
      date: string;
      type: DrinkType;
      quantity: number;
      unit: DrinkUnit;
    };

    if (!id || !date || !type || !quantity || !unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { content, sha } = await getFile(DATA_PATH);
    const data: AlcoholData = JSON.parse(content);
    const idx = data.entries.findIndex((e) => e.id === id);
    if (idx === -1) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    data.entries[idx] = { id, date, type, quantity: Number(quantity), unit, totalMl: Number(quantity) * UNIT_ML[unit] };
    data.entries.sort((a, b) => a.date.localeCompare(b.date));

    await updateFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", sha, `Update ${type} entry for ${date}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { content, sha } = await getFile(DATA_PATH);
    const data: AlcoholData = JSON.parse(content);
    data.entries = data.entries.filter((e) => e.id !== id);

    await updateFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", sha, `Delete entry ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
