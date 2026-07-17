import datetime
from pydantic import BaseModel, ConfigDict


class DocumentMetadata(BaseModel):
    equipmentID: str | None = None
    systemRef: str | None = None
    aiSummary: str | None = None
    extractedParameters: dict | None = None
    wordCount: int | None = None


class DocumentBase(BaseModel):
    title: str
    category: str
    content: str
    tags: list[str] = []


class DocumentCreate(DocumentBase):
    id: str
    uploaded_by: str
    metadata_fields: DocumentMetadata = DocumentMetadata()


class DocumentResponse(DocumentBase):
    id: str
    uploaded_by: str
    upload_date: datetime.datetime
    metadata_fields: DocumentMetadata

    model_config = ConfigDict(from_attributes=True)
