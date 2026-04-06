import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.VOICE_REDUCER_API_URL ?? "http://localhost:8000";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    const res = await fetch(`${BACKEND}/download-mp4-job/${jobId}`);
    if (!res.ok) return NextResponse.json({ error: "Download failed" }, { status: res.status });
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "video/mp4",
        "Content-Disposition": res.headers.get("content-disposition") ?? `attachment; filename="output.mp4"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
