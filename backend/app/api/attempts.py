"""API endpoints for problem attempts, including user history retrieval."""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.attempt import AttemptDetailResponse, AttemptHistoryResponse
from app.services.attempt_service import AttemptService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/attempts", tags=["attempts"])
attempt_service = AttemptService()


@router.get(
    "/history",
    response_model=AttemptHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user's attempt history",
)
def get_attempt_history(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed, minimum 1)"),
    limit: int = Query(default=20, ge=1, le=50, description="Items per page (1 to 50, default 20)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AttemptHistoryResponse:
    """Retrieve paginated problem attempts for the authenticated user, ordered newest first."""
    try:
        return attempt_service.get_user_history(
            db=db,
            user=current_user,
            page=page,
            limit=limit,
        )
    except Exception as exc:
        logger.error(
            "Failed to retrieve attempt history for user %s: %s",
            current_user.id,
            exc,
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving attempt history.",
        )


@router.get(
    "/{attempt_id}",
    response_model=AttemptDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user's attempt details",
)
def get_attempt_detail(
    attempt_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AttemptDetailResponse:
    """Retrieve details and complete structured solution for a specific attempt owned by the authenticated user."""
    try:
        detail = attempt_service.get_attempt_detail(
            db=db,
            user=current_user,
            attempt_id=attempt_id,
        )
        if not detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Problem attempt not found.",
            )
        return detail
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Failed to retrieve attempt %s for user %s: %s",
            attempt_id,
            current_user.id,
            exc,
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving attempt details.",
        )
