"""
Audio separation using demucs htdemucs model.
Returns both the instrumental MP3 and a vocals-only MP3 (used by Whisper for transcription).
"""

import subprocess
import shutil
import pathlib
import sys
from typing import Tuple


def separate(input_mp3: pathlib.Path, output_dir: pathlib.Path) -> Tuple[pathlib.Path, pathlib.Path]:
    """
    Run demucs --two-stems=vocals on input_mp3.
    Returns (instrumental_mp3, vocals_mp3).
    vocals_mp3 is kept for Whisper — clean vocals = much better transcription accuracy.
    """
    stem = input_mp3.stem
    output_dir.mkdir(parents=True, exist_ok=True)

    result = subprocess.run(
        [
            sys.executable, "-m", "demucs",
            "--two-stems", "vocals",
            "-o", str(output_dir),
            str(input_mp3),
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"demucs failed (exit {result.returncode}):\n"
            f"STDOUT: {result.stdout[-1000:]}\n"
            f"STDERR: {result.stderr[-1000:]}"
        )

    # Locate demucs output directory (handles model name variants)
    stem_dir = output_dir / "htdemucs" / stem
    if not stem_dir.exists():
        htdemucs_dir = output_dir / "htdemucs"
        if htdemucs_dir.exists():
            subdirs = [d for d in htdemucs_dir.iterdir() if d.is_dir()]
            if subdirs:
                stem_dir = subdirs[0]

    no_vocals_wav = stem_dir / "no_vocals.wav"
    vocals_wav    = stem_dir / "vocals.wav"

    if not no_vocals_wav.exists():
        raise FileNotFoundError(f"no_vocals.wav not found. demucs output:\n{result.stdout[-2000:]}")

    def to_mp3(wav: pathlib.Path, out: pathlib.Path):
        r = subprocess.run(
            ["ffmpeg", "-y", "-i", str(wav), "-q:a", "2", str(out)],
            capture_output=True, text=True,
        )
        if r.returncode != 0:
            raise RuntimeError(f"ffmpeg failed converting {wav.name}:\n{r.stderr[-1000:]}")

    instrumental_mp3 = output_dir / f"{stem}_instrumental.mp3"
    vocals_mp3       = output_dir / f"{stem}_vocals.mp3"

    to_mp3(no_vocals_wav, instrumental_mp3)
    if vocals_wav.exists():
        to_mp3(vocals_wav, vocals_mp3)
    else:
        vocals_mp3 = input_mp3   # fallback to original if vocals.wav missing

    # Clean up WAV intermediates
    if stem_dir.exists():
        shutil.rmtree(stem_dir)

    return instrumental_mp3, vocals_mp3
