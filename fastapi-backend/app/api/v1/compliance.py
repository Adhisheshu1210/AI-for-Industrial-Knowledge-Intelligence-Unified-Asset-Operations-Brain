from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.compliance import ComplianceAudit
from app.schemas.compliance import ComplianceAuditRequest, ComplianceAuditResponse
from app.services.gemini import gemini_service
from app.core.redis import cache_manager

router = APIRouter()


@router.post("/audit", response_model=ComplianceAuditResponse, status_code=status.HTTP_201_CREATED)
async def create_compliance_audit(
    payload: ComplianceAuditRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a procedural scenario for instant EHS and safety regulatory auditing.
    Utilizes Gemini for clause lookup and risk rating, persisting results to PostgreSQL.
    """
    # Run the compliance scan via Gemini
    audit_results = await gemini_service.analyze_compliance(payload.scenario_description)
    
    # Save to DB
    db_audit = ComplianceAudit(
        scenario_description=payload.scenario_description,
        compliance_status=audit_results["compliance_status"],
        risk_level=audit_results["risk_level"],
        incident_risk_rating=audit_results["incident_risk_rating"],
        findings=audit_results["findings"],
        breached_clauses=audit_results["breached_clauses"],
        remediation_steps=audit_results["remediation_steps"],
        audited_by=current_user.fullname
    )
    
    db.add(db_audit)
    await db.commit()
    await db.refresh(db_audit)
    
    # Clear dashboard cache
    await cache_manager.delete("dashboard_analytics")
    
    return db_audit


@router.get("/history", response_model=list[ComplianceAuditResponse])
async def list_audit_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches the log history of EHS audits."""
    from sqlalchemy.future import select
    query = select(ComplianceAudit).order_by(ComplianceAudit.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())
