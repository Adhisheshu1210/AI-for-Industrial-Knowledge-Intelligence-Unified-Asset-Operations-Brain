from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.document import Document
from app.models.compliance import ComplianceAudit
from app.models.lessons import LessonLearned
from app.core.redis import cache_manager

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Compiles dashboard metrics including document counts, audits, and safety ratings."""
    cached_metrics = await cache_manager.get_json("dashboard_analytics")
    if cached_metrics:
        return cached_metrics

    # 1. Total Documents
    doc_count_query = select(func.count()).select_from(Document)
    doc_count_res = await db.execute(doc_count_query)
    total_documents = doc_count_res.scalar() or 0

    # 2. Total Audits Run
    audit_count_query = select(func.count()).select_from(ComplianceAudit)
    audit_count_res = await db.execute(audit_count_query)
    total_audits = audit_count_res.scalar() or 0

    # 3. Total Lessons Learned Codified
    lessons_count_query = select(func.count()).select_from(LessonLearned)
    lessons_count_res = await db.execute(lessons_count_query)
    total_lessons = lessons_count_res.scalar() or 0

    # 4. Average safety risk score calculation
    avg_risk_query = select(func.avg(ComplianceAudit.incident_risk_rating)).select_from(ComplianceAudit)
    avg_risk_res = await db.execute(avg_risk_query)
    avg_risk_rating = round(float(avg_risk_res.scalar() or 0.0), 1)

    # 5. Get distribution of document categories
    category_query = select(Document.category, func.count()).group_by(Document.category)
    category_res = await db.execute(category_query)
    category_distribution = {row[0]: row[1] for row in category_res.all()}

    metrics = {
        "total_documents": total_documents,
        "total_audits": total_audits,
        "total_lessons_codified": total_lessons,
        "average_incident_risk_rating": avg_risk_rating,
        "category_distribution": category_distribution,
        "database_status": "OPTIMAL",
        "redis_cached": True
    }

    await cache_manager.set_json("dashboard_analytics", metrics, expire_seconds=300)
    return metrics
