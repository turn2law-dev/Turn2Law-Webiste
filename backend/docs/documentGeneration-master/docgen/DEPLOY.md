# Turn2Law Document Engine — Production Deployment Guide

The document engine is a **Python FastAPI** service that uses **XeLaTeX** to generate
legal PDFs. It cannot run inside Vercel (which is serverless/stateless). It must be
deployed as a **persistent container service** and then wired to the Vercel frontend
via the `DOCUMENT_GENERATION_API_URL` environment variable.

---

## Architecture

```
Browser
  ↓
Vercel (Next.js)
  ↓  DOCUMENT_GENERATION_API_URL
Document Engine (this service — Railway / Render / Fly.io)
  ↓  XeLaTeX
PDF generated → served at /files/<id>.pdf
  ↓
Vercel /files/* rewrite → user downloads PDF
```

---

## Option A — Deploy on Railway (recommended)

Railway supports Docker natively and has a generous free tier.

### Steps

1. Create a free account at https://railway.app
2. New Project → **Deploy from GitHub repo**
3. Select the repo, then set the **Root Directory** to:
   ```
   backend/docs/documentGeneration-master/docgen
   ```
4. Railway auto-detects `Dockerfile` and `railway.json`
5. After the first deploy completes, go to **Settings → Domains → Generate Domain**
6. Set these **Environment Variables** in Railway:

   | Variable | Value |
   |---|---|
   | `GEMINI_API_KEY` | your Google AI Studio key |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |
   | `CORS_ORIGINS` | `https://your-app.vercel.app` (comma-separated if multiple) |
   | `T2L_COMPANY_NAME` | `EFFIVIA TURN2LAW LEGAL PRIVATE LIMITED` |
   | `T2L_SIGNATORY_NAME` | your signatory name |
   | `T2L_DESIGNATION` | `Founder & CEO` |
   | `T2L_COMPANY_EMAIL` | your email |

7. Copy the generated Railway domain (e.g. `https://turn2law-docengine.up.railway.app`)
8. Go to **Vercel → your project → Settings → Environment Variables** and set:
   ```
   DOCUMENT_GENERATION_API_URL = https://turn2law-docengine.up.railway.app
   ```
9. Redeploy Vercel to pick up the new variable

### Health check

```
GET https://turn2law-docengine.up.railway.app/health
→ { "status": "ok", "service": "turn2law-docengine" }
```

---

## Option B — Deploy on Render

1. Create a free account at https://render.com
2. New → **Web Service** → Connect GitHub repo
3. Set **Root Directory** to:
   ```
   backend/docs/documentGeneration-master/docgen
   ```
4. Render detects `Dockerfile` and `render.yaml` automatically
5. Set the environment variables listed in `render.yaml` (marked `sync: false`)
6. After deploy, copy the `.onrender.com` URL
7. Set `DOCUMENT_GENERATION_API_URL` in Vercel to that URL

> **Note:** Render free tier spins down after 15 minutes of inactivity.
> The first PDF request after idle will take ~30 seconds to wake up.
> Upgrade to Render Starter ($7/mo) to avoid cold starts.

---

## Option C — Local / self-hosted

```bash
cd backend/docs/documentGeneration-master/docgen
cp .env.example .env
# Edit .env — set GEMINI_API_KEY and CORS_ORIGINS
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Then in `frontend/.env.local`:
```
DOCUMENT_GENERATION_API_URL=http://localhost:8000
```

---

## Required system packages (included in Dockerfile)

| Package | Purpose |
|---|---|
| `texlive-xetex` | XeLaTeX PDF compiler |
| `texlive-latex-extra` | Additional LaTeX packages |
| `texlive-fonts-extra` | Extended font support |
| `tesseract-ocr` | OCR for document classification |
| `libgl1` | PyMuPDF dependency |

---

## Environment variables reference

See `.env.example` for the full list.

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google AI Studio key for AI classification |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash` |
| `CORS_ORIGINS` | Yes (prod) | Comma-separated list of allowed frontend origins |
| `T2L_COMPANY_NAME` | No | Company name on Turn2Law branded documents |
| `T2L_SIGNATORY_NAME` | No | Signatory name on Turn2Law documents |

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns `{"status":"ok"}` |
| `GET` | `/api/templates` | List all document templates |
| `GET` | `/api/schema/{doc_type}` | Field schema for a template |
| `POST` | `/api/generate` | Generate PDF (JSON body) |
| `POST` | `/api/generate-with-branding` | Generate with custom assets (multipart) |
| `POST` | `/api/generate-with-letterhead` | Generate with full-page letterhead (multipart) |
| `POST` | `/api/classify` | Classify an uploaded document |
| `POST` | `/api/sign` | Digitally sign a generated PDF |
| `GET` | `/files/{filename}` | Download a generated file |

---

## Vercel environment variables (frontend)

After deploying the engine, set these in **Vercel → Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL         = https://lysanzaeuwyrsxcvunzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    = <from Supabase dashboard>
GEMINI_API_KEY                   = <Google AI Studio key>
DOCUMENT_GENERATION_API_URL      = https://<your-engine>.railway.app
NEXT_PUBLIC_API_URL              = https://<your-backend>.railway.app
NEXT_PUBLIC_LAWGPT_API_URL       = https://<your-backend>.railway.app
USE_MOCK_MODEL                   = true
RESEND_API_KEY                   = <optional>
```
