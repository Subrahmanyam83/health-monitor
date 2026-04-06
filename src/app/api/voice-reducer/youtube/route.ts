import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const res = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        downloadMode: "audio",
        audioFormat: "mp3",
        audioBitrate: "320",
      }),
    });

    const data = await res.json();

    if (data.status === "error") {
      return NextResponse.json({ error: data.error?.code ?? "Download failed" }, { status: 400 });
    }

    if (data.status === "redirect" || data.status === "tunnel") {
      return NextResponse.json({ downloadUrl: data.url, filename: data.filename ?? "audio.mp3" });
    }

    return NextResponse.json({ error: "Unexpected response from cobalt" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Failed to reach cobalt.tools" }, { status: 502 });
  }
}
