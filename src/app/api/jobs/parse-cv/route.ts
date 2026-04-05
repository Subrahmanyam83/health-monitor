import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Dynamically import pdf-parse (avoids SSR issues)
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    const text = parsed.text;

    // Extract basic info from text
    const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);

    return NextResponse.json({ text, lines: lines.slice(0, 50), fileName: file.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 });
  }
}
