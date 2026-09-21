import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.problem import Problem
    from app.models.problem_tag import ProblemTag


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )

    # Relationships
    problem_tags: Mapped[list["ProblemTag"]] = relationship(
        back_populates="tag", cascade="all, delete-orphan"
    )
    problems: Mapped[list["Problem"]] = relationship(
        secondary="problem_tags", back_populates="tags", viewonly=True
    )

    def __repr__(self) -> str:
        return f"<Tag id={self.id} name={self.name}>"
