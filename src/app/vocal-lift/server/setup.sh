#!/bin/bash
set -e

echo "=== Karaoke Vocal Remover — Setup ==="
echo ""

# Check ffmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "Installing ffmpeg via Homebrew..."
  brew install ffmpeg
else
  echo "✓ ffmpeg found: $(ffmpeg -version 2>&1 | head -1)"
fi

# Create virtual environment with Python 3.11 if available, else Python 3
PYTHON=$(command -v python3.11 || command -v python3)
echo ""
echo "Using Python: $($PYTHON --version)"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  $PYTHON -m venv venv
fi

echo "Activating venv and installing dependencies..."
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To start the app, run:"
echo "  source venv/bin/activate && uvicorn main:app --port 8000"
echo "  then open http://localhost:8000"
echo ""
echo "Note: On first vocal removal, the AI model (~1.5 GB) will be downloaded."
