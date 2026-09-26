"""Pydantic schemas for problem attempt history and pagination."""

from datetime import datetime
import json
import logging
from typing import Optional
import uuid

from pydantic import BaseModel, ConfigDict, Field

logger = logging.getLogger(__name__)


def extract_solution_preview(ai_response: str | None, max_chars: int = 300) -> Optional[str]:
    """Safely extracts a concise solution preview from the stored ai_response JSON or text.

    Extracts the empathetic 'understanding' summary from LifeFixSolutionResponse JSON
    if present, falling back to the first recommended step or truncated text,
    without exposing full prompts, context, or internal JSON structures.
    """
    if not ai_response:
        return None
    try:
        data = json.loads(ai_response)
        if isinstance(data, dict):
            preview = data.get("understanding")
            if not preview and data.get("recommended_steps"):
                steps = data["recommended_steps"]
                if isinstance(steps, list) and len(steps) > 0 and isinstance(steps[0], dict):
                    preview = steps[0].get("title") or steps[0].get("instruction")
            if preview and isinstance(preview, str):
                preview = preview.strip()
                if len(preview) > max_chars:
                    return preview[:max_chars].rstrip() + "..."
                return preview
    except Exception:
        pass

    clean = ai_response.strip()
    if len(clean) > max_chars:
        return clean[:max_chars].rstrip() + "..."
    return clean or None


class AttemptHistoryItem(BaseModel):
    """Concise representation of a single problem attempt in a user's history."""

    id: uuid.UUID = Field(..., description="Unique UUID of the problem attempt")
    user_message: str = Field(..., description="Original problem message submitted by user")
    created_at: datetime = Field(..., description="Timestamp when the attempt was created")
    was_successful: Optional[bool] = Field(
        default=None, description="Resolution status (True=solved, False=unsolved, None=pending feedback)"
    )
    parent_attempt_id: Optional[uuid.UUID] = Field(
        default=None, description="UUID of the parent attempt if this attempt was a refinement"
    )
    solution_preview: Optional[str] = Field(
        default=None, description="Concise summary preview of the AI-recommended solution"
    )

    model_config = ConfigDict(from_attributes=True)


class AttemptHistoryResponse(BaseModel):
    """Paginated list of problem attempts for the authenticated user."""

    items: list[AttemptHistoryItem] = Field(
        default_factory=list, description="List of problem attempts on the current page"
    )
    page: int = Field(..., description="Current page number (1-indexed)")
    limit: int = Field(..., description="Number of items per page")
    total: int = Field(..., description="Total number of attempts belonging to the user")
    has_next: bool = Field(..., description="True if subsequent pages of attempts exist")
