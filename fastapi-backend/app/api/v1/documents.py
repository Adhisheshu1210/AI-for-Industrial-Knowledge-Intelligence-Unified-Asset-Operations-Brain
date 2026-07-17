import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.repositories.document import document_repo
from app.schemas.document import DocumentResponse
from app.services.ocr import ocr_service
from app.services.gemini import gemini_service
from app.core.redis import cache_manager

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("SOP"),
    tags: str = Form(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads an industrial document file (SOP, datasheet, manual).
    Extracts text via OCR, runs Gemini to tag metadata, and saves to PostgreSQL.
    """
    file_bytes = await file.read()
    
    # 1. OCR Extraction
    ocr_result = await ocr_service.extract_text_from_file(file.filename, file_bytes)
    content = ocr_result["text"]
    
    # 2. Structured Gemini Tagging
    gemini_meta = await gemini_service.process_document_ocr(file.filename, content)
    
    # Parse tags
    custom_tags = [t.strip() for t in tags.split(",") if t.strip()]
    final_tags = list(set(gemini_meta.get("tags", []) + custom_tags))

    doc_id = str(uuid.uuid4())[:8]
    
    db_doc = Document(
        id=doc_id,
        title=gemini_meta.get("title", file.filename.split(".")[0].title()),
        category=category,
        content=content,
        uploaded_by=current_user.fullname,
        tags=final_tags,
        metadata_fields={
            "equipmentID": gemini_meta.get("equipmentID", "N/A"),
            "systemRef": gemini_meta.get("systemRef", "N/A"),
            "aiSummary": gemini_meta.get("aiSummary", "N/A"),
            "extractedParameters": gemini_meta.get("extractedParameters", {}),
            "wordCount": ocr_result["word_count"]
        }
    )
    
    # Invalidating caches
    await cache_manager.delete("dashboard_analytics")
    await cache_manager.delete("documents_list")
    
    return await document_repo.create(db, obj_in=db_doc)


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all uploaded documents. Integrates high-performance Redis caching."""
    cached_docs = await cache_manager.get_json("documents_list")
    if cached_docs:
        return cached_docs

    documents = await document_repo.get_multi(db, limit=100)
    
    # Format to match schema
    response_list = []
    for doc in documents:
        response_list.append({
            "id": doc.id,
            "title": doc.title,
            "category": doc.category,
            "content": doc.content,
            "uploaded_by": doc.uploaded_by,
            "upload_date": doc.upload_date,
            "tags": doc.tags,
            "metadata_fields": doc.metadata_fields
        })
        
    await cache_manager.set_json("documents_list", response_list, expire_seconds=600)
    return response_list


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches a specific document by its ID."""
    doc = await document_repo.get(db, id=doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "id": doc.id,
        "title": doc.title,
        "category": doc.category,
        "content": doc.content,
        "uploaded_by": doc.uploaded_by,
        "upload_date": doc.upload_date,
        "tags": doc.tags,
        "metadata_fields": doc.metadata_fields
    }


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes an uploaded document and purges related cache entries."""
    doc = await document_repo.get(db, id=doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    await document_repo.delete(db, id=doc_id)
    
    await cache_manager.delete("dashboard_analytics")
    await cache_manager.delete("documents_list")
    return None
