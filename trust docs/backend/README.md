# TrustDocs Backend

The Node.js backend for TrustDocs, powered by Express and LlamaIndex. It handles PDF text extraction, vector indexing, and RAG (Retrieval-Augmented Generation) queries.

## 🛠️ Main Components

- **Express Server**: Provides API endpoints for upload, questioning, and health checks.
- **LlamaIndex**: Manages the document pipeline (Document -> Chunks -> Vector Index).
- **PDF-Parse**: Extracts raw text from uploaded PDF buffers.
- **LLM Integration**:
  - Supports **Ollama** (Local models like Gemma 3).
  - Supports **Google Gemini** (Gemini 2.0 Flash).

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload` | Upload PDF, extract text, and build vector index. |
| `POST` | `/api/ask` | Query the document with a question. |
| `GET` | `/api/health` | Check API and LLM configuration status. |
| `GET` | `/api/summary` | Retrieve the generated 5-point document summary. |
| `GET` | `/api/metadata` | Get document risk flags (penalties, deadlines, etc.). |

## ⚙️ Configuration

Create a `.env` file in this directory:

```env
GOOGLE_API_KEY=AIza... (Optional if using Ollama)
PORT=3001
```

## 🚀 Development

```bash
npm install
npm run dev
```
