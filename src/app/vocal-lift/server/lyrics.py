"""
Lyrics pipeline:
  1. syncedlyrics  — searches Musixmatch/LRClib/NetEase for synced LRC lyrics
                     (accurate, human-curated, great Bollywood coverage)
  2. Whisper ASR   — fallback when lyrics are not found online

Output is always romanized to clean lowercase ASCII for display.
"""

from __future__ import annotations

import re
import pathlib
from typing import List, Optional, Tuple


# ── Whisper model (lazy-loaded only if syncedlyrics fails) ────────────────────
_whisper_model = None
WHISPER_MODEL_SIZE = "large-v2"


def _get_whisper():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        _whisper_model = whisper.load_model(WHISPER_MODEL_SIZE)
    return _whisper_model


# ── Metadata ──────────────────────────────────────────────────────────────────

def _clean_title(title: str) -> str:
    """Strip YouTube-style junk: (Audio), [Official], | Channel | Artist..."""
    title = re.sub(r'\s*[\(\[][^\)\]]*[\)\]]', '', title)   # remove (...) and [...]
    title = title.split('|')[0]                              # drop everything after |
    title = title.split(' - ')[0]                            # drop suffix after ' - '
    return title.strip()


def get_metadata(mp3_path: pathlib.Path) -> Tuple[str, str]:
    """Extract title and artist from MP3 ID3 tags."""
    try:
        from mutagen.id3 import ID3
        tags = ID3(str(mp3_path))
        title  = str(tags.get('TIT2', '')).strip() or mp3_path.stem
        artist = str(tags.get('TPE1', '')).strip()
        return title, artist
    except Exception:
        return mp3_path.stem, ''


# ── LRC parsing ───────────────────────────────────────────────────────────────

def _parse_lrc(lrc: str, total_duration: float) -> List[Tuple[float, float, str]]:
    """
    Convert LRC text → list of (start_sec, end_sec, text).
    End time = start of next line (or total_duration for the last line).
    """
    pattern = re.compile(r'\[(\d+):(\d+\.\d+)\](.*)')
    raw: List[Tuple[float, str]] = []

    for line in lrc.strip().split('\n'):
        m = pattern.match(line.strip())
        if m:
            ts = int(m.group(1)) * 60 + float(m.group(2))
            text = m.group(3).strip()
            if text:
                raw.append((ts, text))

    segments: List[Tuple[float, float, str]] = []
    for i, (start, text) in enumerate(raw):
        end = raw[i + 1][0] if i + 1 < len(raw) else total_duration
        segments.append((start, end, text))
    return segments


# ── Romanization ──────────────────────────────────────────────────────────────

def _has_non_ascii(text: str) -> bool:
    return any(ord(c) > 127 for c in text)


def _romanize(text: str) -> str:
    """Convert any script (Devanagari etc.) to clean lowercase ASCII."""
    if not _has_non_ascii(text):
        return text.lower()

    # unidecode: most reliable for Devanagari → ASCII phonetic
    try:
        from unidecode import unidecode
        result = unidecode(text).strip().lower()
        if sum(c.isalpha() for c in result) > len(text) * 0.2:
            return result
    except Exception:
        pass

    # indic_transliteration ITRANS fallback
    try:
        from indic_transliteration import sanscript
        from indic_transliteration.sanscript import transliterate
        return transliterate(text, sanscript.DEVANAGARI, sanscript.ITRANS).lower()
    except Exception:
        pass

    return ''.join(c if ord(c) < 128 else ' ' for c in text).strip().lower()


# ── Primary: syncedlyrics search ─────────────────────────────────────────────

def _fetch_synced_lrc(title: str, artist: str) -> Optional[str]:
    """Search Musixmatch/LRClib/NetEase for synced lyrics. Returns raw LRC or None."""
    import syncedlyrics

    clean = _clean_title(title)
    label_words = ('t-series', 'records', 'music', 'films', 'entertainment', 'official', 'studios')
    real_artist = '' if any(w in artist.lower() for w in label_words) else artist

    queries = [
        f"{clean} {real_artist}".strip(),
        clean,
        f"{title} {real_artist}".strip(),
    ]

    for q in queries:
        if not q:
            continue
        try:
            lrc = syncedlyrics.search(q)
            if lrc and lrc.strip():
                return lrc
        except Exception:
            continue
    return None


# ── Fallback: Whisper ASR ─────────────────────────────────────────────────────

def _whisper_transcribe(mp3_path: pathlib.Path) -> List[Tuple[float, float, str]]:
    """Transcribe via Whisper and romanize. Used only when lyrics not found online."""
    model = _get_whisper()
    result = model.transcribe(
        str(mp3_path),
        task="transcribe",
        language="hi",
        initial_prompt="Hindi Bollywood song lyrics:",
        temperature=0.0,
        verbose=False,
        fp16=False,
    )
    segments = []
    for seg in result.get("segments", []):
        text = _romanize(seg["text"].strip())
        if text.strip():
            segments.append((float(seg["start"]), float(seg["end"]), text))
    return segments


# ── Public API ────────────────────────────────────────────────────────────────

def get_lyrics(
    source_mp3: pathlib.Path,
    original_mp3: pathlib.Path,
    total_duration: float,
) -> Tuple[List[Tuple[float, float, str]], str]:
    """
    Returns (segments, source_label) where source_label is 'online' or 'whisper'.
    segments = list of (start_sec, end_sec, romanized_text).

    Strategy:
      1. Read ID3 tags from original_mp3
      2. Search syncedlyrics (Musixmatch / LRClib / NetEase)
      3. If found → parse LRC → romanize
      4. If not found → Whisper on source_mp3 (clean vocals)
    """
    title, artist = get_metadata(original_mp3)

    # Try online lyrics first
    lrc = _fetch_synced_lrc(title, artist)
    if lrc:
        raw_segments = _parse_lrc(lrc, total_duration)
        segments = [(s, e, _romanize(t)) for s, e, t in raw_segments if t.strip()]
        if segments:
            return segments, "online"

    # Fall back to Whisper
    segments = _whisper_transcribe(source_mp3)
    return segments, "whisper"
