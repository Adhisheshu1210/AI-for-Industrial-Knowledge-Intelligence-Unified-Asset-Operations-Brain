import datetime
from sqlalchemy import String, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class LessonLearned(Base):
    __tablename__ = "lessons_learned"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    raw_observation: Mapped[str] = mapped_column(Text, nullable=False)
    formal_title: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_category: Mapped[str] = mapped_column(String(100), nullable=False)
    scientific_rationale: Mapped[str] = mapped_column(Text, nullable=False)
    fundamental_cause: Mapped[str] = mapped_column(Text, nullable=False)
    floor_guidelines: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    permanent_engineering_solution: Mapped[str] = mapped_column(Text, nullable=False)
    safety_precautions: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    author: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
