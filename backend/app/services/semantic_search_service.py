"""Semantic search service for LifeFix problems using PostgreSQL + pgvector.

Performs vector cosine-distance similarity retrieval against stored Problem embeddings
using the HNSW index on `problems.embedding` with `vector_cosine_ops`.
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.problem import Problem
from app.schemas.search import SearchResultItem
from app.services.embedding_service import EmbeddingService


class SemanticSearchService:
    """Service responsible for semantic problem retrieval via pgvector cosine distance."""

    DEFAULT_TOP_K: int = 5
    MIN_TOP_K: int = 1
    MAX_TOP_K: int = 20

    def __init__(self, embedding_service: Optional[EmbeddingService] = None) -> None:
        """Initialize the search service with a shared EmbeddingService instance."""
        self.embedding_service = embedding_service or EmbeddingService()

    @classmethod
    def validate_query(cls, query: str) -> str:
        """Validate search query string.

        Raises:
            ValueError: If query is not a string, is empty, or contains only whitespace.
        """
        if not isinstance(query, str):
            raise ValueError(f"Query must be a string, got {type(query).__name__}.")
        clean_query = query.strip()
        if not clean_query:
            raise ValueError("Query text cannot be empty or contain only whitespace.")
        return clean_query

    @classmethod
    def validate_top_k(cls, top_k: int) -> int:
        """Validate top_k parameter bounds.

        Raises:
            ValueError: If top_k is not an integer between MIN_TOP_K and MAX_TOP_K.
        """
        if not isinstance(top_k, int) or isinstance(top_k, bool):
            raise ValueError(f"top_k must be an integer, got {type(top_k).__name__}.")
        if top_k < cls.MIN_TOP_K or top_k > cls.MAX_TOP_K:
            raise ValueError(
                f"top_k must be between {cls.MIN_TOP_K} and {cls.MAX_TOP_K}, got {top_k}."
            )
        return top_k

    def search_problems(
        self,
        db: Session,
        query: str,
        top_k: int = DEFAULT_TOP_K,
    ) -> list[SearchResultItem]:
        """Search problems by semantic similarity to a natural-language query.

        Args:
            db: SQLAlchemy database session.
            query: Natural language query text (English, Arabic, or mixed).
            top_k: Number of most similar problems to return (1 <= top_k <= 20).

        Returns:
            list[SearchResultItem]: Ranked list of matching problems, ordered from
                                    highest similarity to lowest (rank 1 to top_k).

        Raises:
            ValueError: If query is empty/whitespace or top_k is outside [1, 20].
        """
        clean_query = self.validate_query(query)
        valid_top_k = self.validate_top_k(top_k)

        # 1. Generate query embedding using E5 asymmetric convention ('query: <text>')
        query_vector = self.embedding_service.embed_query(clean_query)

        # 2. Build pgvector cosine-distance expression: distance = 1.0 - cosine_similarity
        # This matches the HNSW index on problems.embedding USING hnsw (embedding vector_cosine_ops)
        distance_expr = Problem.embedding.cosine_distance(query_vector).label("distance")

        # 3. Construct SQLAlchemy query: order by cosine distance ascending
        statement = (
            select(Problem, distance_expr)
            .options(joinedload(Problem.category))
            .where(Problem.embedding.is_not(None))
            .order_by(distance_expr.asc())
            .limit(valid_top_k)
        )

        rows = db.execute(statement).all()

        # 4. Convert cosine distance to similarity score: similarity = 1.0 - distance
        results: list[SearchResultItem] = []
        for rank, (problem, distance) in enumerate(rows, start=1):
            raw_distance = float(distance)
            similarity = 1.0 - raw_distance
            category_name = problem.category.name if problem.category else "Uncategorized"

            results.append(
                SearchResultItem(
                    problem_id=str(problem.id),
                    title=problem.title,
                    description=problem.description,
                    category=category_name,
                    similarity_score=similarity,
                    rank=rank,
                )
            )

        return results
