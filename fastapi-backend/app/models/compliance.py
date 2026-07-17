import datetime
from sqlalchemy import String, DateTime, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class ComplianceAudit(Base):
    __tablename__ = "compliance_audits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    scenario_description: Mapped[str] = mapped_column(String(2000), nullable=False)
    compliance_status: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "COMPLIANT", "WARNING", "VIOLATION"
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "LOW", "MEDIUM", "HIGH"
    incident_risk_rating: Mapped[int] = mapped_column(Integer, nullable=False) # out of 100
    findings: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    breached_clauses: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    remediation_steps: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    audited_by: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
