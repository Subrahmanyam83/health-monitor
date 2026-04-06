"""
Karaoke video: instrumental MP3 + synced lyrics → scrolling MP4 with word highlighting.

Layout:
  ┌─────────────────────────────────────┐
  │   [previous line — very dim]        │
  │                                     │
  │   [CURRENT LINE — white, with       │
  │    highlighted word in YELLOW]      │
  │                                     │
  │   [next line — soft dim preview]    │
  └─────────────────────────────────────┘

At each line change, all three lines scroll upward smoothly.
Within a line, each word lights up in yellow as it is sung.
"""

from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
from typing import List, Optional, Tuple

from lyrics import get_lyrics, get_metadata

# ── Video dimensions ──────────────────────────────────────────────────────────
W, H = 1280, 720

# ── Colours ───────────────────────────────────────────────────────────────────
BG           = (13,  13,  26)
C_HIGHLIGHT  = (255, 220,  0)   # yellow — word currently being sung
C_CURRENT    = (255, 255, 255)  # white  — rest of current line
C_NEXT       = (155, 140, 200)  # dim purple — next line preview
C_PREV       = ( 70,  65, 110)  # very dim   — previous line

# ── Layout (fraction of H) ───────────────────────────────────────────────────
LINE_PREV = 0.30
LINE_CURR = 0.48
LINE_NEXT = 0.66
LINE_GAP  = LINE_CURR - LINE_PREV   # used for scroll shift

# ── Scroll transition ─────────────────────────────────────────────────────────
TRANS_DUR    = 0.40   # seconds per scroll animation
TRANS_FPS    = 12
TRANS_FRAMES = max(1, round(TRANS_DUR * TRANS_FPS))

# ── Font paths ────────────────────────────────────────────────────────────────
FONT_PATHS = [
    "/Library/Fonts/Arial Unicode.ttf",
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Avenir Next.ttc",
]

MARGIN = 90   # horizontal margin for text


# ── Font helpers ──────────────────────────────────────────────────────────────

def _load_font(size: int):
    from PIL import ImageFont
    for p in FONT_PATHS:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()


# ── Word-level layout ─────────────────────────────────────────────────────────

def _space_w(font, draw) -> int:
    bx = draw.textbbox((0, 0), "a b", font=font)
    bx2 = draw.textbbox((0, 0), "ab", font=font)
    return (bx[2] - bx[0]) - (bx2[2] - bx2[0])


def _word_widths(words: List[str], font, draw) -> List[int]:
    return [draw.textbbox((0, 0), w, font=font)[2] - draw.textbbox((0, 0), w, font=font)[0]
            for w in words]


def _wrap_words(words: List[str], font, draw, max_w: int) -> List[List[str]]:
    """Split word list into display lines that fit within max_w pixels."""
    sp = _space_w(font, draw)
    lines: List[List[str]] = []
    cur: List[str] = []
    cur_w = 0
    for word in words:
        ww = draw.textbbox((0, 0), word, font=font)[2]
        need = ww + (sp if cur else 0)
        if cur and cur_w + need > max_w:
            lines.append(cur)
            cur = [word]
            cur_w = ww
        else:
            cur.append(word)
            cur_w += need
    if cur:
        lines.append(cur)
    return lines or [[]]


def _draw_words(draw, display_lines: List[List[str]], global_highlight: int,
                font, center_y: int, line_h: int,
                normal_col: Tuple, highlight_col: Optional[Tuple] = None):
    """
    Draw word-wrapped lines centered at center_y.
    Word at global index global_highlight is drawn in highlight_col.
    Pass global_highlight = -1 for no highlighting (whole line uses normal_col).
    """
    sp = _space_w(font, draw)
    total_lines = len(display_lines)
    total_h = total_lines * line_h
    y = center_y - total_h // 2

    word_idx = 0
    for dline in display_lines:
        # Measure line width to center it
        widths = _word_widths(dline, font, draw)
        line_w = sum(widths) + sp * max(0, len(dline) - 1)
        x = (W - line_w) // 2

        for i, (word, ww) in enumerate(zip(dline, widths)):
            if highlight_col is not None and word_idx == global_highlight:
                color = highlight_col
            else:
                color = normal_col
            draw.text((x, y), word, font=font, fill=color)
            x += ww + sp
            word_idx += 1

        y += line_h


def _line_height(font, draw) -> int:
    bx = draw.textbbox((0, 0), "Ag", font=font)
    return (bx[3] - bx[1]) + 10


# ── Frame rendering ───────────────────────────────────────────────────────────

def _ease(t: float) -> float:
    return t * t * (3.0 - 2.0 * t)


def _lerp_col(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _render_frame(
    font_curr, font_other,
    prev_words: List[str],
    curr_words: List[str],
    next_words: List[str],
    highlight_idx: int = -1,     # which word in curr_words to highlight (-1 = none)
    scroll: float = 0.0,         # 0=static, 1=fully transitioned
    new_next_words: Optional[List[str]] = None,
):
    from PIL import Image, ImageDraw

    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    t    = _ease(scroll)
    shift = int(t * LINE_GAP * H)

    max_w = W - MARGIN * 2
    lh_curr  = _line_height(font_curr,  draw)
    lh_other = _line_height(font_other, draw)

    def cy(ratio: float) -> int:
        return int(ratio * H) - shift

    # ── Previous line (fades out as it scrolls up) ────────────────────────────
    if prev_words:
        col = _lerp_col(C_PREV, BG, t)
        dl  = _wrap_words(prev_words, font_other, draw, max_w)
        _draw_words(draw, dl, -1, font_other, cy(LINE_PREV), lh_other, col)

    # ── Current line (dims and rises during scroll) ───────────────────────────
    if curr_words:
        # During scroll: curr moves up and dims; static: bright with highlight
        curr_base = _lerp_col(C_CURRENT, C_PREV, t)
        hi_col    = _lerp_col(C_HIGHLIGHT, C_PREV, t) if highlight_idx >= 0 else None
        dl = _wrap_words(curr_words, font_curr, draw, max_w)
        _draw_words(draw, dl, highlight_idx, font_curr, cy(LINE_CURR), lh_curr, curr_base, hi_col)

    # ── Next line (brightens and rises to centre during scroll) ───────────────
    if next_words:
        col = _lerp_col(C_NEXT, C_CURRENT, t)
        f   = font_curr if t > 0.6 else font_other
        dl  = _wrap_words(next_words, f, draw, max_w)
        _draw_words(draw, dl, -1, f, cy(LINE_NEXT), lh_other, col)

    # ── Incoming next-next line (fades in at bottom during scroll) ────────────
    if new_next_words and scroll > 0:
        col = _lerp_col(BG, C_NEXT, t)
        dl  = _wrap_words(new_next_words, font_other, draw, max_w)
        _draw_words(draw, dl, -1, font_other, cy(LINE_NEXT + LINE_GAP), lh_other, col)

    return img


# ── Frame sequence builder ────────────────────────────────────────────────────

def _build_frames(
    segments: List[Tuple[float, float, str]],
    total_duration: float,
    frames_dir: pathlib.Path,
) -> pathlib.Path:

    font_curr  = _load_font(52)
    font_other = _load_font(34)

    # Build scenes with gap-filling
    scenes: List[Tuple[float, float, str, str]] = []
    prev_end = 0.0
    for i, (start, end, text) in enumerate(segments):
        if start > prev_end + 0.05:
            scenes.append((prev_end, start, "", ""))
        nxt = segments[i + 1][2] if i + 1 < len(segments) else ""
        scenes.append((start, end, text, nxt))
        prev_end = end
    if prev_end < total_duration - 0.1:
        scenes.append((prev_end, total_duration, "", ""))

    concat_lines: List[str] = []
    idx = 0
    prev_words: List[str] = []
    last_png: Optional[pathlib.Path] = None

    def save(img, dur: float):
        nonlocal idx, last_png
        png = frames_dir / f"f{idx:06d}.png"
        img.save(str(png))
        concat_lines.append(f"file '{png}'\nduration {dur:.4f}")
        last_png = png
        idx += 1

    for s_idx, (start, end, curr_text, next_text) in enumerate(scenes):
        dur = end - start
        if dur <= 0.02:
            continue

        curr_words = curr_text.split() if curr_text else []
        next_words = next_text.split() if next_text else []
        new_next_words = (scenes[s_idx + 1][2].split()
                          if s_idx + 1 < len(scenes) and scenes[s_idx + 1][2]
                          else [])

        # ── Scroll transition ────────────────────────────────────────────────
        trans_dur = min(TRANS_DUR, dur * 0.35)
        frame_dur = trans_dur / TRANS_FRAMES
        for k in range(TRANS_FRAMES):
            img = _render_frame(
                font_curr, font_other,
                prev_words, curr_words, next_words,
                highlight_idx=-1,
                scroll=(k + 1) / TRANS_FRAMES,
                new_next_words=new_next_words,
            )
            save(img, frame_dur)

        # ── Word-highlight frames ─────────────────────────────────────────────
        remaining = dur - trans_dur
        if curr_words and remaining > 0.05:
            per_word = remaining / len(curr_words)
            for w_idx in range(len(curr_words)):
                img = _render_frame(
                    font_curr, font_other,
                    prev_words, curr_words, next_words,
                    highlight_idx=w_idx,
                    scroll=0.0,
                )
                save(img, per_word)
        elif remaining > 0.05:
            img = _render_frame(font_curr, font_other, prev_words, curr_words, next_words)
            save(img, remaining)

        prev_words = curr_words

    if last_png:
        concat_lines.append(f"file '{last_png}'")

    concat_path = frames_dir / "concat.txt"
    concat_path.write_text("\n".join(concat_lines), encoding="utf-8")
    return concat_path


# ── Utilities ─────────────────────────────────────────────────────────────────

def get_duration(mp3_path: pathlib.Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(mp3_path)],
        capture_output=True, text=True, check=True,
    )
    return float(json.loads(result.stdout)["format"]["duration"])


# ── Public API ────────────────────────────────────────────────────────────────

def create_karaoke_video(
    instrumental_mp3: pathlib.Path,
    source_mp3: pathlib.Path,
    output_dir: pathlib.Path,
    job_id: str,
) -> Tuple[Optional[pathlib.Path], Optional[str]]:

    # Step 1: Get lyrics (online first, Whisper fallback)
    try:
        duration = get_duration(instrumental_mp3)
        segments, source = get_lyrics(source_mp3, source_mp3, duration)
    except Exception as exc:
        return None, f"Lyrics fetch failed: {exc}"

    if not segments:
        return None, "No lyrics found online and Whisper detected nothing."

    # Step 2: Render frames
    frames_dir = output_dir / f"frames_{job_id}"
    frames_dir.mkdir(exist_ok=True)
    try:
        concat_path = _build_frames(segments, duration, frames_dir)

        # Step 3: Mux video + audio
        stem = instrumental_mp3.stem.replace("_instrumental", "")
        video_path = output_dir / f"{stem}_karaoke.mp4"

        result = subprocess.run(
            [
                "ffmpeg", "-y",
                "-f", "concat", "-safe", "0", "-i", str(concat_path),
                "-i", str(instrumental_mp3),
                "-c:v", "libx264", "-preset", "fast", "-crf", "22",
                "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k",
                "-shortest",
                str(video_path),
            ],
            capture_output=True, text=True,
        )

        if result.returncode != 0:
            return None, f"Video render failed: {result.stderr[-800:]}"

        return video_path, None

    finally:
        shutil.rmtree(frames_dir, ignore_errors=True)
