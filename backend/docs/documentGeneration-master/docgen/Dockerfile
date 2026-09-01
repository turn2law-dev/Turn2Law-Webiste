# ─────────────────────────────────────────────────────────────────────────────
# Turn2Law Document Generation Engine
# Docker image — XeLaTeX + Python 3.11
#
# Build:  docker build -t t2l-docengine .
# Run:    docker run -p 8000:8000 --env-file .env t2l-docengine
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# ── System packages ───────────────────────────────────────────────────────────
# XeLaTeX for PDF generation + Tesseract for OCR + libGL for PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-xetex \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    fonts-liberation \
    fonts-dejavu \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies (cached layer) ───────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application source ────────────────────────────────────────────────────────
COPY . .

# Output directory for generated PDFs
RUN mkdir -p generated_docs

# PORT is injected by Render at runtime — default 8000 for local dev
ENV PORT=8000

EXPOSE $PORT

# Use shell form so $PORT is expanded at runtime
CMD uvicorn api:app --host 0.0.0.0 --port $PORT
