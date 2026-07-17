from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse, SemanticSearchRequest, SemanticSearchResult
from app.repositories.document import document_repo
from app.services.gemini import gemini_service
from app.services.vector_search import vector_search_service

router = APIRouter()


@router.post("/copilot", response_model=ChatResponse)
async def chat_copilot(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    RAG-powered conversational endpoint.
    Retrieves grounded context from documents and coordinates response synthesis with Gemini.
    """
    context = ""
    sources = []
    
    # 1. Retrieve specific grounding document
    if payload.documentId:
        doc = await document_repo.get(db, id=payload.documentId)
        if doc:
            context = doc.content
            sources.append(doc.title)
    else:
        # Perform dynamic semantic search across all manuals
        matches = await vector_search_service.query_semantic_matches(db, query=payload.message, limit=2)
        if matches:
            context_list = []
            for match in matches:
                doc = await document_repo.get(db, id=match["document_id"])
                if doc:
                    context_list.append(doc.content[:1000])
                    sources.append(doc.title)
            context = "\n---\n".join(context_list)

    # Convert history payload to dictionary structure
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]

    # Generate response
    ai_response = await gemini_service.chat_with_copilot(
        message=payload.message,
        history=history_dicts,
        context=context if context else None
    )
    
    return ChatResponse(response=ai_response, sources=sources)


@router.post("/search", response_model=list[SemanticSearchResult])
async def semantic_search(
    payload: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Performs semantic concept ranking across plant documentation."""
    results = await vector_search_service.query_semantic_matches(
        db, query=payload.query, limit=payload.limit, category=payload.category
    )
    return [
        SemanticSearchResult(
            document_id=r["document_id"],
            title=r["title"],
            snippet=r["snippet"],
            score=r["score"]
        ) for r in results
    ]
