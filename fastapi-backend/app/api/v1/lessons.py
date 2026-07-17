import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.lessons import LessonLearned
from app.schemas.lessons import LessonObservationRequest, LessonObservationResponse
from app.services.gemini import gemini_service
from app.core.redis import cache_manager

router = APIRouter()


@router.post("/formalize", response_model=LessonObservationResponse, status_code=status.HTTP_201_CREATED)
async def formalize_operator_observation(
    payload: LessonObservationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Translates loose operator tribal knowledge observations into structured,
    ISO-9001 standardized lessons learned utilizing system physics reasoning.
    """
    # 1. Coordinate structured codification via Gemini
    structured_data = await gemini_service.formalize_observation(
        title=payload.title,
        observation=payload.raw_observation
    )
    
    lesson_id = f"LL-{uuid.uuid4().hex[:6].upper()}"
    
    db_lesson = LessonLearned(
        id=lesson_id,
        raw_observation=payload.raw_observation,
        formal_title=structured_data["formal_title"],
        asset_category=structured_data["asset_category"],
        scientific_rationale=structured_data["scientific_rationale"],
        fundamental_cause=structured_data["fundamental_cause"],
        floor_guidelines=structured_data["floor_guidelines"],
        permanent_engineering_solution=structured_data["permanent_engineering_solution"],
        safety_precautions=structured_data["safety_precautions"],
        author=current_user.fullname
    )
    
    db.add(db_lesson)
    await db.commit()
    await db.refresh(db_lesson)
    
    await cache_manager.delete("lessons_learned_list")
    await cache_manager.delete("dashboard_analytics")
    
    return db_lesson


@router.get("/", response_model=list[LessonObservationResponse])
async def list_lessons(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all structured, codified reliability lessons learned."""
    cached_lessons = await cache_manager.get_json("lessons_learned_list")
    if cached_lessons:
        return cached_lessons

    from sqlalchemy.future import select
    query = select(LessonLearned).order_by(LessonLearned.created_at.desc())
    result = await db.execute(query)
    lessons = list(result.scalars().all())
    
    response_list = []
    for l in lessons:
        response_list.append({
            "id": l.id,
            "raw_observation": l.raw_observation,
            "formal_title": l.formal_title,
            "asset_category": l.asset_category,
            "scientific_rationale": l.scientific_rationale,
            "fundamental_cause": l.fundamental_cause,
            "floor_guidelines": l.floor_guidelines,
            "permanent_engineering_solution": l.permanent_engineering_solution,
            "safety_precautions": l.safety_precautions,
            "author": l.author,
            "created_at": l.created_at
        })
        
    await cache_manager.set_json("lessons_learned_list", response_list, expire_seconds=600)
    return response_list
