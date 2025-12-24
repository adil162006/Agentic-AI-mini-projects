from langchain_ollama import OllamaEmbeddings
from app.core.config import settings

def get_embedding_model():
    """
    Initialize and return the Ollama embedding model based on configuration settings.
    """
    embedding_model_name = settings.EMBEDDING_MODEL
    embedding_model = OllamaEmbeddings(model=embedding_model_name,  base_url='http://127.0.0.1:11434')
    return embedding_model