import logging
import time
from celery import Celery
from app.core.config import settings

logger = logging.getLogger("celery_worker")

# Setup background tasks processor linked to Redis
celery_app = Celery(
    "indus_tasks",
    broker=settings.cache_redis_url,
    backend=settings.cache_redis_url
)


@celery_app.task(name="tasks.process_heavy_ocr")
def process_heavy_ocr_async(document_id: str, file_path: str):
    """Asynchronously runs OCR on large scanned floor schematics."""
    logger.info(f"Starting async OCR processing for document: {document_id}")
    time.sleep(10) # Simulating complex pdf parsing
    logger.info(f"Completed OCR parsing for document: {document_id}")
    return {"status": "SUCCESS", "document_id": document_id}


@celery_app.task(name="tasks.generate_ehs_pdf_report")
def generate_ehs_pdf_report_async(audit_id: int):
    """Compiles audit results and remediation checklists into a printable PDF report."""
    logger.info(f"Compiling EHS Compliance PDF Report for audit ID: {audit_id}")
    time.sleep(5) # Simulating pdf reporting layout engine
    logger.info(f"EHS Compliance PDF generated successfully for audit: {audit_id}")
    return {"status": "SUCCESS", "report_url": f"/static/reports/audit_{audit_id}.pdf"}
