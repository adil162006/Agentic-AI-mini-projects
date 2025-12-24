from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload
from app.core.config import settings
from app.api import chat
from app.models.chat import QueryRequest


app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

# Enable CORS for the frontend dev server during development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router, prefix="/api/v1", tags=["Ingestion"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"]) # <--- Register Chat Router

@app.get("/")
def health_check():
    return {"status": "ok", "message": "RAG Backend is running"}

@app.post("/query")
async def answer(req: QueryRequest):
    # Placeholder implementation — replace with RAG logic later
    return {"query": req.query, "answer": "This is a placeholder response."}

print(settings.CHROMA_PERSIST_DIR)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
