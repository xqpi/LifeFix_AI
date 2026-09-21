import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.problem_attempt import ProblemAttempt
    from app.models.problem_tag import ProblemTag
    from app.models.search_result import SearchResult
    from app.models.solution import Solution
    from app.models.tag import Tag
    from app.models.user import User


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    difficulty: Mapped[str] = mapped_column(
        String(50), default="medium", nullable=False
    )
    estimated_time_minutes: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    category: Mapped["Category"] = relationship(back_populates="problems")
    creator: Mapped["User | None"] = relationship(
        back_populates="problems", foreign_keys=[created_by]
    )
    solutions: Mapped[list["Solution"]] = relationship(
        back_populates="problem",
        cascade="all, delete-orphan",
        order_by="Solution.step_number",
    )
    problem_tags: Mapped[list["ProblemTag"]] = relationship(
        back_populates="problem", cascade="all, delete-orphan"
    )
    tags: Mapped[list["Tag"]] = relationship(
        secondary="problem_tags", back_populates="problems", viewonly=True
    )
    search_results: Mapped[list["SearchResult"]] = relationship(
        back_populates="problem", cascade="all, delete-orphan"
    )
    attempts: Mapped[list["ProblemAttempt"]] = relationship(
        back_populates="original_problem"
    )

    def __repr__(self) -> str:
        return f"<Problem id={self.id} title={self.title}>"
