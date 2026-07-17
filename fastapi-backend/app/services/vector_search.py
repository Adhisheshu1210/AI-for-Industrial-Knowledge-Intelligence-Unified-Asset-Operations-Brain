import difflib
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.document import document_repo


class VectorSearchService:
    async def query_semantic_matches(
        self, db: AsyncSession, query: str, limit: int = 3, category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Simulates vector search RAG with string matching similarity score.
        Queries database records and ranks them based on diff-matching against query.
        """
        documents = await document_repo.get_multi(db, limit=100)
        
        matches = []
        for doc in documents:
            if category and doc.category.lower() != category.lower():
                continue
                
            # Compute a similarity score using SequenceMatcher
            title_score = difflib.SequenceMatcher(None, query.lower(), doc.title.lower()).ratio()
            content_score = difflib.SequenceMatcher(None, query.lower(), doc.content[:1000].lower()).ratio()
            final_score = max(title_score, content_score)
            
            # Find a snippet matching a keyword or return first 200 chars
            snippet = doc.content[:250] + "..."
            
            matches.append({
                "document_id": doc.id,
                "title": doc.title,
                "snippet": snippet,
                "score": round(final_score, 4)
            })
            
        # Sort by score descending
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:limit]


vector_search_service = VectorSearchService()
