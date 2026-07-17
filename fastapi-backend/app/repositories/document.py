from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.document import Document
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self):
        super().__init__(Document)

    async def get_by_category(self, db: AsyncSession, category: str) -> List[Document]:
        query = select(self.model).where(self.model.category == category)
        result = await db.execute(query)
        return list(result.scalars().all())


document_repo = DocumentRepository()
