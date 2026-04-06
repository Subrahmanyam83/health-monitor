import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.VOICE_REDUCER_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${BACKEND}/upload-for-mp4`, { method: "POST", body: formData });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
