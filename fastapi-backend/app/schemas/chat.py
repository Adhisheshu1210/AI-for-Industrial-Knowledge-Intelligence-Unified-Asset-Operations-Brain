from pydantic import BaseModel
from typing import List, Optional


class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    documentId: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []


class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 5
    category: Optional[str] = None


class SemanticSearchResult(BaseModel):
    document_id: str
    title: str
    snippet: str
    score: float
