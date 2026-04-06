FROM python:3.11-slim

# System dependencies: ffmpeg for audio/video processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the htdemucs model so first request isn't slow
RUN python -c "from demucs.pretrained import get_model; get_model('htdemucs')" || true

# Copy application code
COPY . .

# Create working directories
RUN mkdir -p uploads outputs

EXPOSE 8000

# Railway injects $PORT — fall back to 8000 for local Docker runs
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
