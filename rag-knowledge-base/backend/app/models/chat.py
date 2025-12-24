from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    question: str
    chat_history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

class QueryRequest(BaseModel):
    query: str