import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.feedback import Feedback
    from app.models.problem import Problem
    from app.models.user import User


class ProblemAttempt(Base):
    __tablename__ = "problem_attempts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_problem_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("problems.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    parent_attempt_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("problem_attempts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    user_message: Mapped[str] = mapped_column(Text, nullable=False)
    ai_response: Mapped[str] = mapped_column(Text, nullable=False)
    was_successful: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="problem_attempts")
    original_problem: Mapped["Problem | None"] = relationship(
        back_populates="attempts"
    )
    parent_attempt: Mapped["ProblemAttempt | None"] = relationship(
        back_populates="refinements", remote_side=[id]
    )
    refinements: Mapped[list["ProblemAttempt"]] = relationship(
        back_populates="parent_attempt"
    )
    feedbacks: Mapped[list["Feedback"]] = relationship(
        back_populates="attempt", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<ProblemAttempt id={self.id} user_id={self.user_id} was_successful={self.was_successful}>"
