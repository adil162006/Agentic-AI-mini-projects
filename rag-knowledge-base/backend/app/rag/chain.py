from langchain_groq import ChatGroq

# langchain v1.0+ moved `chains` into `langchain_classic`; try that first
try:
    from langchain_classic.chains.retrieval import create_retrieval_chain
    from langchain_classic.chains.combine_documents import create_stuff_documents_chain
except Exception:
    # fallback for older langchain versions
    from langchain.chains.retrieval import create_retrieval_chain
    from langchain.chains.combine_documents import create_stuff_documents_chain

from app.rag.vectorstore import get_vectorstore
from app.rag.prompts import rag_prompt
from app.core.config import settings

def get_rag_chain():
    # 1. Setup LLM (Groq)
    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name=settings.GROQ_MODEL,  # e.g., "llama3-70b-8192"
        temperature=0
    )
    
    # 2. Setup Retriever
    # We get the vectorstore (which uses Ollama embeddings internally)
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # 3. Create the "Answer Generator" Chain
    # This combines: Prompt + LLM
    question_answer_chain = create_stuff_documents_chain(llm, rag_prompt)
    
    # 4. Create the final RAG Chain
    # This combines: Retriever + Answer Generator
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    return rag_chain