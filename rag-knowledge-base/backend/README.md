Backend FastAPI server for RAG knowledge base

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Run (development):

```bash
uvicorn main:app --reload
```

Endpoints:

- `GET /` : status message
- `GET /health` : health check
- `POST /query` : accepts JSON `{ "query": "your question" }` and returns a placeholder answer

