import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "RAG Chatbot (Ollama)"
    PROJECT_VERSION: str = "1.0.0"
    
    EMBEDDING_MODEL: str = "nomic-embed-text"
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    GROQ_MODEL: str = "llama3-70b-8192"  # Or "mixtral-8x7b-32768"
    # Database Settings
    CHROMA_PERSIST_DIR: str = "./chroma_db"

settings = Settings()