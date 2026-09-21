import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.problem import Problem


class Solution(Base):
    __tablename__ = "solutions"
    __table_args__ = (
        CheckConstraint(
            "step_number > 0", name="ck_solution_step_number_positive"
        ),
        UniqueConstraint(
            "problem_id", "step_number", name="uq_solution_problem_step"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    problem_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    solution_text: Mapped[str] = mapped_column(Text, nullable=False)
    step_number: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False
    )
    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)
    estimated_time_minutes: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    problem: Mapped["Problem"] = relationship(back_populates="solutions")

    def __repr__(self) -> str:
        return f"<Solution id={self.id} problem_id={self.problem_id} step={self.step_number}>"
