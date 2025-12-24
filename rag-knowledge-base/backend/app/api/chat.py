from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.rag.chain import  get_rag_chain


router = APIRouter()

@router.post("/query", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Get the Chain
        chain = get_rag_chain()
        
        # 2. Run the Chain
        # "input" is the key expected by the prompt template
        result = chain.invoke({"input": request.question})
        
        # 3. Extract Sources (Metadata from the chunks)
        sources = []
        if "context" in result:
            sources = list(set([doc.metadata.get("source", "Unknown") for doc in result["context"]]))
        
        return ChatResponse(
            answer=result["answer"],
            sources=sources
        )
    except Exception as e:
        print(f"Error: {str(e)}") # Print error to server logs
        raise HTTPException(status_code=500, detail=str(e))