# 📘 RAG App – FastAPI + LangChain + LangGraph

A **2–3 day beginner-friendly RAG project** using **FastAPI**, **LangChain**, **LangGraph**, and managed with **uv**.

---

## 🧱 Tech Stack

* **Backend**: FastAPI
* **RAG Framework**: LangChain
* **Workflow Orchestration**: LangGraph
* **Vector Database**: Chroma
* **LLM**: OpenAI / Ollama / Groq (any one)
* **Package Manager**: uv
* **Python**: 3.10+

---

## 📁 Folder Structure

```text
backend/
│
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── upload.py
│   │   └── chat.py
│   ├── core/
│   │   └── config.py
│   ├── models/
│   │   └── chat.py
│   ├── rag/
│   │   ├── loaders.py
│   │   ├── splitter.py
│   │   ├── embeddings.py
│   │   ├── vectorstore.py
│   │   ├── prompts.py
│   │   └── graph.py
│   └── services/
│       └── ingestion.py
│
├── uploads/
│   └── .gitkeep
├── .env.example
├── requirements.txt
├── pyproject.toml
├── .python-version
└── README.md
```

---

## 📦 Dependency Setup (uv)

### Initialize project

```bash
uv init backend
cd backend
```

### Install dependencies

```bash
uv add fastapi uvicorn python-dotenv pydantic
uv add langchain langgraph
uv add langchain-openai
uv add chromadb
uv add pypdf
```

> If using Ollama instead of OpenAI:

```bash
uv add langchain-community
```

### Run the server

```bash
uv run uvicorn app.main:app --reload
```

---

## 🔐 Environment Variables (`.env`)

```env
OPENAI_API_KEY=sk-xxxx
```

---

## 🗓️ Day-wise Implementation Plan

---

## ✅ Day 1 – Document Ingestion (Core RAG)

**Goal**: Upload documents and store embeddings in a vector database.

### Tasks

* Setup FastAPI app and routing
* File upload endpoint
* Load documents (PDF / TXT)
* Chunk text
* Generate embeddings
* Store embeddings in Chroma

### Files to implement

* `app/main.py`
* `api/upload.py`
* `services/ingestion.py`
* `rag/loaders.py`
* `rag/splitter.py`
* `rag/embeddings.py`
* `rag/vectorstore.py`

🎯 **Outcome**: Documents are ingested and searchable

---

## ✅ Day 2 – Querying + LangGraph

**Goal**: Ask questions and get answers grounded in documents.

### Tasks

* Retrieve relevant chunks from vector DB
* Create prompt templates
* Build LangGraph workflow
* Generate answers using LLM
* Return source documents

### Files to implement

* `rag/prompts.py`
* `rag/graph.py`
* `api/chat.py`
* `models/chat.py`

🎯 **Outcome**: RAG pipeline works end-to-end

---

## ✅ Day 3 – Polish & Demo (Optional)

**Goal**: Make the project demo-ready.

### Tasks

* Simple frontend (HTML/JS or React)
* Show source chunks
* Handle no-context answers
* Improve prompts
* Add logging / error handling

🎯 **Outcome**: Clean demo suitable for GitHub & portfolio

---

## 🔁 LangGraph Workflow

```text
User Query
   ↓
Retrieve Documents
   ↓
(Optional) Relevance Filtering
   ↓
Generate Answer
   ↓
Return Answer + Sources
```

LangGraph Nodes:

* `retrieve_docs`
* `filter_docs` (optional)
* `generate_answer`

---

## 🚀 Stretch Features (Optional)

* Multi-user document namespaces
* Conversation memory
* Streaming responses
* Feedback loop
* Caching

---

## 📌 Best Practices

* Keep API routes thin
* Isolate all RAG logic inside `rag/`
* Use `services/` for workflows
* Never hardcode secrets

---

## 🏁 Final Outcome

A clean, production-style **RAG backend** that:

* Uses LangGraph correctly
* Is realistic but beginner-friendly
* Can be completed in **2–3 days**
* Looks strong on a resume and GitHub
