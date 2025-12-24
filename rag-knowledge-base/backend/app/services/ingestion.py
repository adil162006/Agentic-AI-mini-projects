import os
import shutil
from app.rag.loaders import load_pdf
from app.rag.splitter import split_documents
from app.rag.vectorstore import get_vectorstore
from app.rag.embeddings import get_embedding_model

UPLOAD_DIR = "uploads"

def save_upload_file(upload_file):
    """Saves the uploaded file to disk."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, upload_file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path

def process_document(file_path: str):
    """Orchestrates Loading -> Splitting -> Indexing"""
    
    # 1. Load the PDF
    docs = load_pdf(file_path)
    
    # 2. Split into chunks
    splits = split_documents(docs)

    # Quick sanity-check: ensure embeddings can be computed for text chunks
    try:
        emb = get_embedding_model()
        texts = [d.page_content for d in splits]
        # Prefer embed_documents API
        if hasattr(emb, 'embed_documents'):
            embs = emb.embed_documents(texts)
        elif hasattr(emb, 'embed'):
            embs = emb.embed(texts)
        else:
            embs = None

        if not embs or len(embs) == 0:
            raise ValueError("Embeddings returned empty list — check your embedding model or service (Ollama) is running and model name is correct")
    except Exception as e:
        # Surface a clearer error for frontend / logs
        raise RuntimeError(f"Failed to compute embeddings for document: {str(e)}")
    
    # 3. Store in Vector Database
    # This automatically calls the embedding model we defined
    vectorstore = get_vectorstore()
    try:
        if hasattr(vectorstore, 'add_documents'):
            vectorstore.add_documents(documents=splits)
        elif hasattr(vectorstore, 'add_texts'):
            texts = [d.page_content for d in splits]
            metadatas = [getattr(d, 'metadata', {}) or {} for d in splits]
            vectorstore.add_texts(texts=texts, metadatas=metadatas)
        else:
            raise RuntimeError('Vectorstore does not support add_documents or add_texts')
    except Exception as e:
        raise RuntimeError(f'Failed to store documents in vectorstore: {e}')
    
    return {
        "status": "success",
        "chunks_added": len(splits),
        "document_name": os.path.basename(file_path)
    }