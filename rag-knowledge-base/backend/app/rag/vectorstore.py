"""Vector store (Chroma) configuration.

This module tries to initialize a Chroma vectorstore in a resilient way so
that import/constructor differences across langchain/chromadb versions are
handled gracefully and surfaced with clear errors.
"""
from app.core.config import settings
from app.rag.embeddings import get_embedding_model
import os


def _choose_embed_fn(emb):
    if hasattr(emb, "embed_documents"):
        return emb.embed_documents
    if hasattr(emb, "embed"):
        return emb.embed
    # Some adapters accept the embedding instance directly
    return emb


def get_vectorstore():
    """Return an initialized Chroma vectorstore instance.

    Tries multiple import paths and constructor signatures to be tolerant of
    environment/dependency mismatches. Raises a helpful RuntimeError when
    initialization fails.
    """
    emb = get_embedding_model()
    embed_fn = _choose_embed_fn(emb)

    # Ensure persist dir exists (Chroma will usually create it, but make it explicit)
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

    # Try the canonical LangChain import first, then fall back to langchain_chroma
    last_err = None
    try:
        from langchain.vectorstores import Chroma as LCChroma

        return LCChroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=embed_fn,
            collection_name="rag_docs",
        )
    except Exception as e:
        last_err = e

    try:
        # Older/specialized package namespace
        from langchain_chroma import Chroma as LCChroma2

        return LCChroma2(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=embed_fn,
            collection_name="rag_docs",
        )
    except Exception as e:
        last_err = e

    raise RuntimeError(
        "Failed to import or initialize a Chroma vectorstore. "
        "Check that `chromadb` and the appropriate langchain-chroma integration are installed. "
        f"Last error: {last_err}"
    )