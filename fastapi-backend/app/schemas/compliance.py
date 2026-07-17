from pydantic import BaseModel, ConfigDict
import datetime


class ComplianceAuditRequest(BaseModel):
    scenario_description: str


class ComplianceAuditResponse(BaseModel):
    id: int
    scenario_description: str
    compliance_status: str # "COMPLIANT", "WARNING", "VIOLATION"
    risk_level: str # "LOW", "MEDIUM", "HIGH"
    incident_risk_rating: int # out of 100
    findings: list[str]
    breached_clauses: list[str]
    remediation_steps: list[str]
    audited_by: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
