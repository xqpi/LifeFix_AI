import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.problem import Problem
    from app.models.search_history import SearchHistory


class SearchResult(Base):
    __tablename__ = "search_results"
    __table_args__ = (
        CheckConstraint("rank > 0", name="ck_search_result_rank_positive"),
        UniqueConstraint(
            "search_id", "problem_id", name="uq_search_result_problem"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    search_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("search_histories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    problem_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    search_history: Mapped["SearchHistory"] = relationship(
        back_populates="results"
    )
    problem: Mapped["Problem"] = relationship(
        back_populates="search_results"
    )

    def __repr__(self) -> str:
        return f"<SearchResult id={self.id} search_id={self.search_id} problem_id={self.problem_id} rank={self.rank}>"
