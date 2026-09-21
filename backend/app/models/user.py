import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.feedback import Feedback
    from app.models.problem import Problem
    from app.models.problem_attempt import ProblemAttempt
    from app.models.search_history import SearchHistory


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50), default="user", nullable=False
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
    problems: Mapped[list["Problem"]] = relationship(
        back_populates="creator", foreign_keys="Problem.created_by"
    )
    search_histories: Mapped[list["SearchHistory"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    problem_attempts: Mapped[list["ProblemAttempt"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    feedbacks: Mapped[list["Feedback"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
