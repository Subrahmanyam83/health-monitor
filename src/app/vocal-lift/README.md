# Voice Reducer — AI Server

Python backend that powers the Voice Remover feature. Uses the **htdemucs** AI model (by Meta) to separate vocals from any MP3 track.

## Prerequisites

- Python 3.9+
- [Homebrew](https://brew.sh) (Mac) — for ffmpeg

## First-time setup

Run once from the repo root:

```bash
cd src/app/voice-reducer/server
./setup.sh
```

`setup.sh` installs:
- **ffmpeg** via Homebrew (audio/video processing)
- All Python dependencies including **demucs** and **PyTorch**

> The htdemucs model (~1.5 GB) downloads automatically on first use and is cached for subsequent runs.

## Start the server

```bash
cd src/app/voice-reducer/server
source venv/bin/activate
uvicorn main:app --port 8000
```

Keep this terminal open while using the Voice Remover tab in the app.

## How it works

1. The app sends the uploaded MP3 to this local server at `http://localhost:8000`
2. The server runs htdemucs to split audio into stems
3. The instrumental stem is converted back to MP3
4. The app serves it for playback and download

## Processing time

| Track length | Approx. time (CPU) |
|---|---|
| 3 min | ~2–4 min |
| 5 min | ~4–7 min |

## Stopping

Press `Ctrl+C` in the terminal where uvicorn is running.
