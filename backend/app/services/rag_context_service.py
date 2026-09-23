"""Service for retrieving problem solutions and structuring RAG context."""

import uuid
from collections import defaultdict
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.solution import Solution
from app.schemas.rag import (
    RAGContextResponse,
    RAGProblemContext,
    RAGSolutionContext,
)
from app.services.semantic_search_service import SemanticSearchService


class RAGContextService:
    """Service that retrieves relevant problems and their associated solution steps for RAG."""

    def __init__(
        self, search_service: Optional[SemanticSearchService] = None
    ) -> None:
        """Initialize with an existing or default SemanticSearchService instance."""
        self.search_service = search_service or SemanticSearchService()

    def build_context(
        self,
        db: Session,
        query: str,
        top_k: int = SemanticSearchService.DEFAULT_TOP_K,
    ) -> RAGContextResponse:
        """Retrieve top-K matching problems and their solutions, structured for RAG context.

        Args:
            db: SQLAlchemy database session.
            query: The user's natural language problem query.
            top_k: Number of most similar problems to retrieve (1 <= top_k <= 20).

        Returns:
            RAGContextResponse: Structured container with original query, top_k,
                                and ranked problems containing their ordered solutions.

        Raises:
            ValueError: If query is empty/whitespace or top_k is out of bounds.
        """
        clean_query = self.search_service.validate_query(query)
        valid_top_k = self.search_service.validate_top_k(top_k)

        # 1. Perform semantic search using the existing SemanticSearchService
        search_results = self.search_service.search_problems(
            db=db, query=clean_query, top_k=valid_top_k
        )

        if not search_results:
            return RAGContextResponse(
                query=clean_query,
                top_k=valid_top_k,
                retrieved_problems=[],
            )

        # 2. Extract problem IDs while preserving rank order
        problem_ids = [uuid.UUID(item.problem_id) for item in search_results]

        # 3. Eagerly load all solutions for these problems in a single batch query
        # to prevent N+1 query patterns. Results are ordered by step_number ascending.
        solutions_stmt = (
            select(Solution)
            .where(Solution.problem_id.in_(problem_ids))
            .order_by(Solution.step_number.asc())
        )
        solution_rows = db.scalars(solutions_stmt).all()

        # Group solutions by problem_id: dict[UUID, list[RAGSolutionContext]]
        solutions_by_problem_id: dict[uuid.UUID, list[RAGSolutionContext]] = defaultdict(list)
        for sol in solution_rows:
            solutions_by_problem_id[sol.problem_id].append(
                RAGSolutionContext(
                    solution_id=str(sol.id),
                    title=sol.title,
                    solution_text=sol.solution_text,
                    step_number=sol.step_number,
                    difficulty=sol.difficulty,
                    estimated_time_minutes=sol.estimated_time_minutes,
                )
            )

        # 4. Assemble RAGProblemContext preserving the original ranking and similarity scores
        retrieved_problems: list[RAGProblemContext] = []
        for item in search_results:
            pid = uuid.UUID(item.problem_id)
            retrieved_problems.append(
                RAGProblemContext(
                    problem_id=item.problem_id,
                    title=item.title,
                    description=item.description,
                    category=item.category,
                    similarity_score=item.similarity_score,
                    rank=item.rank,
                    solutions=solutions_by_problem_id.get(pid, []),
                )
            )

        return RAGContextResponse(
            query=clean_query,
            top_k=valid_top_k,
            retrieved_problems=retrieved_problems,
        )
