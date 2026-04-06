"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

type Tab = "remove" | "mp4" | "youtube";
type Phase = "upload" | "processing" | "done" | "error";

// Background gradient options for MP3→MP4
const BG_OPTIONS = [
  { id: "sunset",  label: "🌅 Sunset",    colors: ["#ff7e5f", "#feb47b"] },
  { id: "ocean",   label: "🌊 Ocean",     colors: ["#1a78c2", "#2bc0e4"] },
  { id: "forest",  label: "🌲 Forest",    colors: ["#134e5e", "#71b280"] },
  { id: "purple",  label: "💜 Dusk",      colors: ["#4776e6", "#8e54e9"] },
  { id: "rose",    label: "🌸 Rose",      colors: ["#f953c6", "#b91d73"] },
];

function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-11 h-11 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
      {label && <p className="text-sm font-medium text-center" style={{ color: "#7c3aed" }}>{label}</p>}
    </div>
  );
}

function DropZone({ onFile, label = "Drop MP3 here or tap to browse" }: { onFile: (f: File) => void; label?: string }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors"
      style={{ borderColor: drag ? "#7c3aed" : "#d8d8e8", background: drag ? "#f5f3ff" : "#fafafa" }}
    >
      <svg className="w-10 h-10" style={{ color: "#a78bfa" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <p className="text-sm font-medium text-center" style={{ color: "#6b7280" }}>{label}</p>
      <input ref={ref} type="file" accept=".mp3,audio/mpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

function DoneCard({ children, onReset, resetLabel = "Start over" }: { children: React.ReactNode; onReset: () => void; resetLabel?: string }) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#d1fae5" }}>
          <svg className="w-4 h-4" style={{ color: "#059669" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: "#111827" }}>Done!</p>
      </div>
      {children}
      <button onClick={onReset} className="text-sm font-medium" style={{ color: "#9ca3af" }}>{resetLabel}</button>
    </div>
  );
}

function ErrorCard({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-sm rounded-2xl p-3" style={{ background: "#fef2f2", color: "#dc2626" }}>{message}</p>
      <button onClick={onReset} className="text-sm font-medium" style={{ color: "#7c3aed" }}>Try again</button>
    </div>
  );
}

const PurpleBtn = ({ href, download, children }: { href: string; download: string; children: React.ReactNode }) => (
  <a href={href} download={download} className="block text-center py-3 rounded-2xl text-sm font-bold text-white"
    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
    {children}
  </a>
);

// ─── Tool 1: Voice Remover (local Python backend) ────────────────────────────
function VoiceRemover() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [statusText, setStatusText] = useState("Processing…");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState("instrumental.mp3");
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = () => { if (pollRef.current) clearInterval(pollRef.current); };
  useEffect(() => () => stopPoll(), []);

  const poll = useCallback((id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/voice-reducer/status/${id}`);
        const data = await res.json();
        if (data.status === "processing") setStatusText("Removing vocals… (this takes 1–3 min)");
        if (data.status === "done") { stopPoll(); setDownloadUrl(`/api/voice-reducer/download/${id}`); setFilename(data.filename ?? "instrumental.mp3"); setPhase("done"); }
        if (data.status === "error") { stopPoll(); setError(data.error ?? "Processing failed"); setPhase("error"); }
      } catch { stopPoll(); setError("Could not reach local backend"); setPhase("error"); }
    }, 3000);
  }, []);

  const handleFile = async (file: File) => {
    setPhase("processing"); setStatusText("Uploading…");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/voice-reducer/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!data.job_id) throw new Error(data.error ?? "Upload failed");
      setStatusText("Queued — removing vocals…");
      poll(data.job_id);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Upload failed"); setPhase("error"); }
  };

  const reset = () => { stopPoll(); setPhase("upload"); setDownloadUrl(null); setError(""); };

  return (
    <div className="flex flex-col gap-4">
      {/* AI model note */}
      <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: "#fef9c3" }}>
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#ca8a04" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
        </svg>
        <p className="text-xs font-medium" style={{ color: "#854d0e" }}>
          The AI model needs to be running as a server for this feature to work.
        </p>
      </div>

      {phase === "upload" && <DropZone onFile={handleFile} />}
      {phase === "processing" && <Spinner label={statusText} />}
      {phase === "done" && (
        <DoneCard onReset={reset} resetLabel="Process another song">
          <audio controls src={downloadUrl!} className="w-full rounded-xl" />
          <PurpleBtn href={downloadUrl!} download={filename}>Download Instrumental MP3</PurpleBtn>
        </DoneCard>
      )}
      {phase === "error" && <ErrorCard message={error} onReset={reset} />}
    </div>
  );
}

// ─── Tool 2: MP3 → MP4 (100% browser via ffmpeg.wasm) ───────────────────────
function MP3ToMP4() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [bg, setBg] = useState(BG_OPTIONS[0]);
  const [progress, setProgress] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const handleFile = async (file: File) => {
    setPhase("processing");
    setProgress("Loading ffmpeg…");
    try {
      // Load ffmpeg.wasm (single-threaded core, no SharedArrayBuffer needed)
      if (!ffmpegRef.current) {
        const ff = new FFmpeg();
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ff.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        ffmpegRef.current = ff;
      }
      const ff = ffmpegRef.current;

      setProgress("Generating background…");

      // Draw gradient background on canvas → PNG
      const canvas = document.createElement("canvas");
      canvas.width = 1280; canvas.height = 720;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, bg.colors[0]);
      grad.addColorStop(1, bg.colors[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      const bgBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
      await ff.writeFile("bg.png", await fetchFile(bgBlob));
      await ff.writeFile("audio.mp3", await fetchFile(file));

      ff.on("progress", ({ progress: p }) => setProgress(`Encoding video… ${Math.round(p * 100)}%`));

      setProgress("Encoding video…");
      await ff.exec([
        "-loop", "1", "-i", "bg.png",
        "-i", "audio.mp3",
        "-c:v", "libx264", "-tune", "stillimage",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest", "output.mp4",
      ]);

      const data = await ff.readFile("output.mp4");
      // Normalise FileData (Uint8Array | string) → plain Uint8Array with a regular ArrayBuffer
      const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
      const plain = new Uint8Array(bytes.length);
      plain.set(bytes);
      const url = URL.createObjectURL(new Blob([plain], { type: "video/mp4" }));
      setDownloadUrl(url);
      setPhase("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setPhase("error");
    }
  };

  const reset = () => { setPhase("upload"); setDownloadUrl(null); setError(""); setProgress(""); };

  return (
    <div className="flex flex-col gap-4">
      {phase === "upload" && (
        <>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>Background</p>
            <div className="grid grid-cols-5 gap-2">
              {BG_OPTIONS.map((b) => (
                <button key={b.id} onClick={() => setBg(b)}
                  className="py-2 px-1 rounded-xl text-[10px] font-semibold text-center transition-all"
                  style={{ background: bg.id === b.id ? "#ede9fe" : "#f3f4f6", color: bg.id === b.id ? "#5b21b6" : "#6b7280", border: bg.id === b.id ? "2px solid #7c3aed" : "2px solid transparent" }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          {/* Preview of selected gradient */}
          <div className="h-12 rounded-xl" style={{ background: `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]})` }} />
          <DropZone onFile={handleFile} label="Drop MP3 here to convert to MP4" />
        </>
      )}
      {phase === "processing" && <Spinner label={progress} />}
      {phase === "done" && (
        <DoneCard onReset={reset} resetLabel="Convert another">
          <PurpleBtn href={downloadUrl!} download="output.mp4">Download MP4</PurpleBtn>
        </DoneCard>
      )}
      {phase === "error" && <ErrorCard message={error} onReset={reset} />}
    </div>
  );
}

// ─── Tool 3: YouTube → MP3 (cobalt.tools free API) ──────────────────────────
function YouTubeDownloader() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [url, setUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState("audio.mp3");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setPhase("processing");
    try {
      const res = await fetch("/api/voice-reducer/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDownloadUrl(data.downloadUrl);
      setFilename(data.filename ?? "audio.mp3");
      setPhase("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Download failed");
      setPhase("error");
    }
  };

  const reset = () => { setPhase("upload"); setUrl(""); setDownloadUrl(null); setError(""); };

  return (
    <div className="flex flex-col gap-4">
      {phase === "upload" && (
        <>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full border rounded-2xl px-4 py-3 text-sm outline-none"
            style={{ borderColor: "#d8d8e8", background: "#fafafa", color: "#111827" }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          <button onClick={handleSubmit} disabled={!url.trim()}
            className="py-3 rounded-2xl text-sm font-bold text-white transition-opacity"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", opacity: url.trim() ? 1 : 0.5 }}>
            Download MP3
          </button>
        </>
      )}
      {phase === "processing" && <Spinner label="Fetching from YouTube…" />}
      {phase === "done" && (
        <DoneCard onReset={reset} resetLabel="Download another">
          <p className="text-xs" style={{ color: "#6b7280" }}>File: {filename}</p>
          <PurpleBtn href={downloadUrl!} download={filename}>Save MP3</PurpleBtn>
        </DoneCard>
      )}
      {phase === "error" && <ErrorCard message={error} onReset={reset} />}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string }[] = [
  { id: "youtube", label: "YouTube → MP3" },
  { id: "mp4",     label: "MP3 → MP4" },
  { id: "remove",  label: "Voice Remover" },
];

export function VoiceReducerApp() {
  const [tab, setTab] = useState<Tab>("remove");
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "#f3f0ff" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all"
            style={{ background: tab === t.id ? "#7c3aed" : "transparent", color: tab === t.id ? "#ffffff" : "#7c3aed" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl p-4" style={{ background: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {tab === "remove"  && <VoiceRemover />}
        {tab === "mp4"     && <MP3ToMP4 />}
        {tab === "youtube" && <YouTubeDownloader />}
      </div>
    </div>
  );
}
