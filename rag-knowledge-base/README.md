# RAG Knowledge Base — Local Dev Guide

This repository contains a small RAG (Retrieval-Augmented Generation) demo with a React frontend and a FastAPI backend that ingests documents into a Chroma vector store and answers queries using embeddings.

**Overview**
- Frontend: Vite + React app in `frontend/` (dev server proxies `/api` to backend).
- Backend: FastAPI app in `backend/` with ingestion and simple query endpoints. Embeddings are produced via Ollama and persisted to Chroma.

**Prerequisites**
- Python (see `backend/pyproject.toml` for required Python version and packages). A virtual environment is recommended.
- Node.js (v16+ / v18+ recommended) and `npm` for the frontend.
- Ollama (if using the included `langchain-ollama` embedding adapter) — run `ollama serve` and ensure the configured embedding model is available.

Backend Setup (FastAPI)

1. Create and activate a virtual environment, then install dependencies:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1   # PowerShell
pip install -r requirements.txt
```

2. Configuration
- Default settings live in `backend/app/core/config.py`. Important values:
  - `EMBEDDING_MODEL`: Ollama embedding model name (default `nomic-embed-text`).
  - `CHROMA_PERSIST_DIR`: directory for Chroma persistence (default `./chroma_db`).
- You can create a `.env` file to override env values.

3. Run the backend

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

4. Endpoints
- Health: `GET http://127.0.0.1:8000/`
- Ingest file: `POST http://127.0.0.1:8000/api/v1/ingest` (multipart form `file`)
- Query: `POST http://127.0.0.1:8000/api/v1/query` (JSON body as implemented)

Common backend troubleshooting
- If you see Chroma import/initialization errors, ensure `chromadb` and the `langchain`/`langchain-chroma` packages from `backend/pyproject.toml` or `requirements.txt` are installed in the active environment.
- If Chroma data seems corrupt, stop the server and try removing the `chroma_db` folder, then re-ingest documents.
- If embedding computation fails, confirm `ollama serve` is running and that the model in `EMBEDDING_MODEL` is available.

Frontend Setup (Vite + React)

1. Install and run

```bash
cd frontend
npm install
npm run dev
```

2. Proxy
- The dev server proxies `/api` to the backend at `http://127.0.0.1:8000` (see `frontend/vite.config.js`). If you get a Vite proxy error such as `http proxy error: /api/v1/ingest`, make sure the backend is running and listening on `127.0.0.1:8000`.

How to use
- Open the frontend dev server URL printed by Vite (usually `http://localhost:5173`).
- Use the upload form to POST a document to the ingest endpoint, then ask questions via the chat UI.

Project Layout
- `backend/` — FastAPI backend, ingestion pipeline, RAG helpers.
- `frontend/` — React + Vite UI.

If you'd like, I can also add step-by-step troubleshooting commands or a one-shot script to create the virtualenv and start both services. Want me to add that?
