from pydantic import BaseModel, ConfigDict
import datetime


class LessonObservationRequest(BaseModel):
    title: str
    raw_observation: str


class LessonObservationResponse(BaseModel):
    id: str
    raw_observation: str
    formal_title: str
    asset_category: str
    scientific_rationale: str
    fundamental_cause: str
    floor_guidelines: list[str]
    permanent_engineering_solution: str
    safety_precautions: list[str]
    author: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
