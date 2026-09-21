import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.search_result import SearchResult
    from app.models.user import User


class SearchHistory(Base):
    __tablename__ = "search_histories"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    query: Mapped[str] = mapped_column(String(500), nullable=False)
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="search_histories")
    category: Mapped["Category | None"] = relationship(
        back_populates="search_histories"
    )
    results: Mapped[list["SearchResult"]] = relationship(
        back_populates="search_history",
        cascade="all, delete-orphan",
        order_by="SearchResult.rank",
    )

    def __repr__(self) -> str:
        return f"<SearchHistory id={self.id} user_id={self.user_id} query='{self.query}'>"
