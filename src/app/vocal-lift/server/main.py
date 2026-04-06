"""
Karaoke Vocal Remover — FastAPI backend (MP3 only)
"""
from __future__ import annotations

import asyncio
import pathlib
import shutil
import subprocess
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager

from fastapi import FastAPI, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from separator import separate

BASE       = pathlib.Path(__file__).parent
UPLOADS    = BASE / "uploads"
OUTPUTS    = BASE / "outputs"
BG_IMAGE   = BASE / "static" / "bg.jpg"
BG_IMAGES  = {
    "1": BASE / "static" / "bg1.jpg",
    "2": BASE / "static" / "bg2.jpg",
    "3": BASE / "static" / "bg3.jpg",
    "4": BASE / "static" / "bg4.jpg",
    "5": BASE / "static" / "bg5.jpg",
}
UPLOADS.mkdir(exist_ok=True)
OUTPUTS.mkdir(exist_ok=True)


def _create_background_image():
    """Generate a royalty-free nature sunset gradient and save to static/bg.jpg."""
    from PIL import Image
    W, H = 1280, 720
    img = Image.new("RGB", (W, H))
    pixels = img.load()
    # Colour stops top→bottom: warm sky → golden horizon → hazy teal → forest green
    stops = [
        (0,   (220, 100,  60)),   # deep orange-red at top
        (0.25,(255, 170,  80)),   # golden amber
        (0.50,(180, 210, 200)),   # hazy sky-teal
        (0.75,( 80, 150, 100)),   # mid-forest green
        (1.0, ( 30,  70,  40)),   # deep forest at bottom
    ]
    for y in range(H):
        t = y / (H - 1)
        # find surrounding stops
        for k in range(len(stops) - 1):
            t0, c0 = stops[k]
            t1, c1 = stops[k + 1]
            if t0 <= t <= t1:
                f = (t - t0) / (t1 - t0)
                r = int(c0[0] + f * (c1[0] - c0[0]))
                g = int(c0[1] + f * (c1[1] - c0[1]))
                b = int(c0[2] + f * (c1[2] - c0[2]))
                break
        for x in range(W):
            pixels[x, y] = (r, g, b)
    img.save(BG_IMAGE, "JPEG", quality=92)

jobs: dict[str, dict] = {}
mp4_jobs: dict[str, dict] = {}
executor = ThreadPoolExecutor(max_workers=2)

MAX_FILE_SIZE_MB = 100
ALLOWED_TYPES    = {"audio/mpeg", "audio/mp3"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg not found. Install with: brew install ffmpeg")
    if not BG_IMAGE.exists():
        _create_background_image()
    yield


app = FastAPI(title="Karaoke Vocal Remover", lifespan=lifespan)


@app.post("/upload")
async def upload(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES and not (file.filename or "").lower().endswith(".mp3"):
        raise HTTPException(400, "Only MP3 files are supported.")

    chunks, total = [], 0
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    while chunk := await file.read(1024 * 1024):
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(413, f"File too large. Max {MAX_FILE_SIZE_MB} MB.")
        chunks.append(chunk)

    job_id     = str(uuid.uuid4())
    input_path = UPLOADS / f"{job_id}.mp3"
    input_path.write_bytes(b"".join(chunks))

    jobs[job_id] = {"status": "pending", "input_path": input_path, "mp3_path": None, "error": None}

    asyncio.get_event_loop().run_in_executor(executor, _run_job, job_id)
    return {"job_id": job_id}


def _run_job(job_id: str):
    job        = jobs[job_id]
    input_path = job["input_path"]
    job["status"] = "processing"
    try:
        instrumental_mp3, vocals_mp3 = separate(input_path, OUTPUTS)
        job["mp3_path"] = instrumental_mp3
        job["status"]   = "done"
    except Exception as exc:
        job["status"] = "error"
        job["error"]  = str(exc)
    finally:
        input_path.unlink(missing_ok=True)
        # vocals MP3 not needed without video feature
        vocals_candidate = OUTPUTS / f"{job_id}_vocals.mp3"
        vocals_candidate.unlink(missing_ok=True)


class YouTubeRequest(BaseModel):
    url: str


@app.post("/from-youtube")
async def from_youtube(req: YouTubeRequest):
    """Download audio from a YouTube URL and queue it for vocal removal."""
    url = req.url.strip()
    if not url:
        raise HTTPException(400, "URL is required.")

    job_id     = str(uuid.uuid4())
    input_path = UPLOADS / f"{job_id}.mp3"

    jobs[job_id] = {"status": "downloading", "input_path": input_path, "mp3_path": None, "error": None}

    asyncio.get_event_loop().run_in_executor(executor, _run_yt_job, job_id, url)
    return {"job_id": job_id}


def _run_yt_job(job_id: str, url: str):
    """Download best quality audio from YouTube and save as MP3. No processing."""
    job        = jobs[job_id]
    input_path = job["input_path"]

    import yt_dlp

    def _ydl_opts(player_client: list):
        return {
            "format": "bestaudio/best",
            "outtmpl": str(input_path.with_suffix("")),
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }],
            "extractor_args": {"youtube": {"player_client": player_client}},
            "socket_timeout": 15,
            "retries": 2,
            "quiet": True,
            "no_warnings": True,
        }

    last_error = None
    for clients in [["ios"], ["android"]]:
        try:
            with yt_dlp.YoutubeDL(_ydl_opts(clients)) as ydl:
                ydl.download([url])
            last_error = None
            break
        except Exception as exc:
            last_error = exc
            input_path.unlink(missing_ok=True)

    if last_error:
        job["status"] = "error"
        job["error"]  = f"YouTube download failed: {last_error}"
        return

    if not input_path.exists():
        job["status"] = "error"
        job["error"]  = "Download completed but MP3 file not found."
        return

    # Move to outputs so it's served alongside other processed files
    out_path = OUTPUTS / input_path.name
    input_path.rename(out_path)
    job["mp3_path"] = out_path
    job["status"]   = "done"


@app.get("/status/{job_id}")
def status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found.")
    resp: dict = {"status": job["status"]}
    if job["status"] == "downloading":
        resp["message"] = "Downloading from YouTube…"
    if job["status"] == "done":
        resp["download_url"] = f"/download/{job_id}"
        resp["filename"]     = job["mp3_path"].name if job["mp3_path"] else None
    elif job["status"] == "error":
        resp["error"] = job.get("error", "Unknown error")
    return resp


@app.get("/download/{job_id}")
def download(job_id: str):
    job = jobs.get(job_id)
    if not job or job["status"] != "done":
        raise HTTPException(404, "Output not ready.")
    path: pathlib.Path = job["mp3_path"]
    if not path or not path.exists():
        raise HTTPException(404, "File missing.")
    return FileResponse(path, media_type="audio/mpeg", filename=path.name)


@app.post("/upload-for-mp4")
async def upload_for_mp4(file: UploadFile, bg: str = Form("1")):
    if file.content_type not in ALLOWED_TYPES and not (file.filename or "").lower().endswith(".mp3"):
        raise HTTPException(400, "Only MP3 files are supported.")
    if bg not in BG_IMAGES:
        raise HTTPException(400, "Invalid background choice.")
    chunks, total = [], 0
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    while chunk := await file.read(1024 * 1024):
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(413, f"File too large. Max {MAX_FILE_SIZE_MB} MB.")
        chunks.append(chunk)
    job_id = str(uuid.uuid4())
    stem = pathlib.Path(file.filename or job_id).stem
    mp3_path = UPLOADS / f"{job_id}.mp3"
    mp3_path.write_bytes(b"".join(chunks))
    mp4_jobs[job_id] = {"status": "converting", "mp3_path": mp3_path, "mp4_path": None, "error": None, "stem": stem, "bg": bg}
    asyncio.get_event_loop().run_in_executor(executor, _run_direct_mp4, job_id)
    return {"job_id": job_id}


def _run_direct_mp4(job_id: str):
    job = mp4_jobs[job_id]
    mp3_path: pathlib.Path = job["mp3_path"]
    mp4_path = OUTPUTS / f"{job['stem']}.mp4"
    bg_path = BG_IMAGES.get(job.get("bg", "1"), BG_IMAGES["1"])
    try:
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(bg_path),
            "-i", str(mp3_path),
            "-map", "0:v", "-map", "1:a",
            "-vf", "scale=1280:720,format=yuv420p",
            "-c:v", "libx264", "-tune", "stillimage", "-preset", "ultrafast",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest",
            str(mp4_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            raise RuntimeError(result.stderr[-800:])
        job["mp4_path"] = mp4_path
        job["status"] = "done"
    except Exception as exc:
        job["status"] = "error"
        job["error"] = str(exc)
    finally:
        mp3_path.unlink(missing_ok=True)


@app.get("/mp4-job-status/{job_id}")
def mp4_job_status(job_id: str):
    job = mp4_jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found.")
    resp: dict = {"status": job["status"]}
    if job["status"] == "done":
        resp["download_url"] = f"/download-mp4-job/{job_id}"
        resp["filename"] = job["mp4_path"].name if job.get("mp4_path") else None
    elif job["status"] == "error":
        resp["error"] = job.get("error", "Unknown error")
    return resp


@app.get("/download-mp4-job/{job_id}")
def download_mp4_job(job_id: str):
    job = mp4_jobs.get(job_id)
    if not job or job["status"] != "done":
        raise HTTPException(404, "MP4 not ready.")
    path: pathlib.Path = job.get("mp4_path")
    if not path or not path.exists():
        raise HTTPException(404, "File missing.")
    return FileResponse(path, media_type="video/mp4", filename=path.name)


@app.post("/convert-to-mp4/{job_id}")
async def convert_to_mp4(job_id: str):
    job = jobs.get(job_id)
    if not job or job["status"] != "done":
        raise HTTPException(400, "Job not ready for conversion.")
    if not job.get("mp3_path") or not job["mp3_path"].exists():
        raise HTTPException(404, "MP3 file not found.")
    if job.get("mp4_status") in ("converting", "done"):
        return {"status": job["mp4_status"]}
    job["mp4_status"] = "converting"
    job["mp4_path"] = None
    job["mp4_error"] = None
    asyncio.get_event_loop().run_in_executor(executor, _run_mp4_conversion, job_id)
    return {"status": "converting"}


def _run_mp4_conversion(job_id: str):
    job = jobs[job_id]
    mp3_path: pathlib.Path = job["mp3_path"]
    mp4_path = OUTPUTS / (mp3_path.stem + ".mp4")
    try:
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(BG_IMAGE),
            "-i", str(mp3_path),
            "-map", "0:v", "-map", "1:a",
            "-vf", "scale=1280:720,format=yuv420p",
            "-c:v", "libx264", "-tune", "stillimage", "-preset", "ultrafast",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest",
            str(mp4_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            raise RuntimeError(result.stderr[-800:])
        job["mp4_path"] = mp4_path
        job["mp4_status"] = "done"
    except Exception as exc:
        job["mp4_status"] = "error"
        job["mp4_error"] = str(exc)


@app.get("/mp4-status/{job_id}")
def mp4_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found.")
    status = job.get("mp4_status", "idle")
    resp: dict = {"status": status}
    if status == "done":
        resp["download_url"] = f"/download-mp4/{job_id}"
        resp["filename"] = job["mp4_path"].name if job.get("mp4_path") else None
    elif status == "error":
        resp["error"] = job.get("mp4_error", "Unknown error")
    return resp


@app.get("/download-mp4/{job_id}")
def download_mp4(job_id: str):
    job = jobs.get(job_id)
    if not job or job.get("mp4_status") != "done":
        raise HTTPException(404, "MP4 not ready.")
    path: pathlib.Path = job.get("mp4_path")
    if not path or not path.exists():
        raise HTTPException(404, "File missing.")
    return FileResponse(path, media_type="video/mp4", filename=path.name)


app.mount("/", StaticFiles(directory=str(BASE / "static"), html=True), name="static")
