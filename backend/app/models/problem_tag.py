import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.problem import Problem
    from app.models.tag import Tag


class ProblemTag(Base):
    __tablename__ = "problem_tags"

    problem_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("problems.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )

    # Relationships
    problem: Mapped["Problem"] = relationship(back_populates="problem_tags")
    tag: Mapped["Tag"] = relationship(back_populates="problem_tags")

    def __repr__(self) -> str:
        return f"<ProblemTag problem_id={self.problem_id} tag_id={self.tag_id}>"
