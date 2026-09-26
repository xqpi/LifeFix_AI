"""Domain service for managing ProblemAttempt state transitions and user feedback."""

import logging
import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.feedback import Feedback
from app.models.problem_attempt import ProblemAttempt
from app.models.user import User
from app.schemas.attempt import (
    AttemptDetailResponse,
    AttemptHistoryItem,
    AttemptHistoryResponse,
    extract_solution_preview,
)
from app.schemas.solver import (
    AttemptFeedbackRequest,
    AttemptFeedbackResponse,
    LifeFixSolutionResponse,
    RefineProblemRequest,
    SolveProblemRequest,
)
from app.services.problem_solver_service import ProblemSolverService

logger = logging.getLogger(__name__)


class AttemptService:
    """Coordinates lifecycle operations, ownership checks, and feedback recording for problem attempts."""

    DEVELOPMENT_GUEST_EMAIL: str = "guest@lifefix.local"

    @staticmethod
    def _is_arabic(text: str) -> bool:
        """Detect if the text contains Arabic characters."""
        return any("\u0600" <= char <= "\u06FF" for char in text)

    def _get_guest_user(self, db: Session) -> User:
        """Retrieve the development guest user for unauthenticated attempts.

        Raises:
            RuntimeError: If the guest user does not exist in the database.
        """
        guest_user = db.scalars(
            select(User).where(User.email == self.DEVELOPMENT_GUEST_EMAIL)
        ).first()

        if not guest_user:
            raise RuntimeError(
                f"Development guest user '{self.DEVELOPMENT_GUEST_EMAIL}' not found in database. "
                "Please run scripts/seed_development_user.py before recording feedback."
            )
        return guest_user

    def _resolve_effective_user(self, db: Session, user: Optional[User] = None) -> User:
        """Resolve the effective user: return user if authenticated, else development guest user."""
        if user is not None:
            return user
        return self._get_guest_user(db)

    def record_feedback(
        self,
        db: Session,
        attempt_id: uuid.UUID,
        request: AttemptFeedbackRequest,
        user: Optional[User] = None,
    ) -> AttemptFeedbackResponse | None:
        """Record user feedback for an existing problem attempt.

        Updates the attempt's was_successful status and optionally creates/updates
        a detailed Feedback record if a rating or comment is provided. Ownership
        is strictly enforced based on the effective user (authenticated user or guest).

        Args:
            db: Active SQLAlchemy database session.
            attempt_id: Valid UUID of the target ProblemAttempt.
            request: Validated AttemptFeedbackRequest.
            user: Optional authenticated User. If None, falls back to development guest user.

        Returns:
            AttemptFeedbackResponse | None: The feedback response if the attempt was found
            and belongs to the effective user; None otherwise (triggers 404).

        Raises:
            RuntimeError: If database persistence fails or guest user is missing.
        """
        effective_user = self._resolve_effective_user(db, user)

        # 1. Enforce ownership: find attempt belonging to the effective user
        attempt = db.scalars(
            select(ProblemAttempt).where(
                ProblemAttempt.id == attempt_id,
                ProblemAttempt.user_id == effective_user.id,
            )
        ).first()

        if not attempt:
            return None

        # 2. Update was_successful status on ProblemAttempt
        attempt.was_successful = request.was_successful

        # 3. Handle optional detailed feedback (rating / comment)
        has_detailed_feedback = (request.rating is not None) or (request.comment is not None)
        feedback_recorded = False

        try:
            if has_detailed_feedback:
                rating_value = request.rating

                # Query existing feedback to update idempotently rather than duplicating
                existing_feedback = db.scalars(
                    select(Feedback).where(
                        Feedback.attempt_id == attempt.id,
                        Feedback.user_id == effective_user.id,
                    )
                ).first()

                if existing_feedback:
                    existing_feedback.rating = rating_value
                    existing_feedback.comment = request.comment
                else:
                    new_feedback = Feedback(
                        user_id=effective_user.id,
                        attempt_id=attempt.id,
                        rating=rating_value,
                        comment=request.comment,
                    )
                    db.add(new_feedback)

                feedback_recorded = True

            # 4. Atomic single-transaction commit
            db.commit()
            db.refresh(attempt)

        except Exception as exc:
            db.rollback()
            logger.error(
                "Failed to commit feedback for attempt %s: %s",
                attempt_id,
                exc,
                exc_info=True,
            )
            raise RuntimeError("Failed to persist feedback to database.") from exc

        # 5. Build user-facing confirmation message
        is_ar = self._is_arabic(attempt.user_message)
        if is_ar:
            if feedback_recorded:
                message = "شكراً لك على تقييمك وملاحظاتك."
            elif request.was_successful:
                message = "شكراً لك. يسعدنا أن الحل ساعدك في حل المشكلة."
            else:
                message = "شكراً لك. يمكنك تقديم تفاصيل إضافية لمساعدتنا في تحسين الحل."
        else:
            if feedback_recorded:
                message = "Thank you for your feedback."
            elif request.was_successful:
                message = "Thank you. We are glad this solved your problem."
            else:
                message = "Thank you. You can provide additional information to refine the solution."

        return AttemptFeedbackResponse(
            attempt_id=str(attempt.id),
            was_successful=attempt.was_successful,
            feedback_recorded=feedback_recorded,
            message=message,
        )

    def refine_attempt(
        self,
        db: Session,
        attempt_id: uuid.UUID,
        request: RefineProblemRequest,
        solver_service: ProblemSolverService,
        user: Optional[User] = None,
    ) -> LifeFixSolutionResponse | None:
        """Refine an unsuccessful problem attempt by appending additional context.

        Validates parent attempt existence, ownership by effective user, and that
        the parent attempt was marked unsuccessful. Combines the original context
        and new clarifications, then runs the full solve pipeline to persist a new
        child ProblemAttempt linked to the parent.

        Args:
            db: Active SQLAlchemy database session.
            attempt_id: UUID of the parent ProblemAttempt.
            request: Validated RefineProblemRequest containing additional_information.
            solver_service: Injected ProblemSolverService instance.
            user: Optional authenticated User. If None, falls back to development guest user.

        Returns:
            LifeFixSolutionResponse | None: The new child attempt solution response,
            or None if the parent attempt is not found or not owned by effective user (triggers 404).

        Raises:
            ValueError: If the parent attempt was not marked unsuccessful (status is None or True).
            RuntimeError: If database persistence or guest user lookup fails.
        """
        effective_user = self._resolve_effective_user(db, user)

        # 1. Enforce ownership and lookup parent attempt
        attempt = db.scalars(
            select(ProblemAttempt).where(
                ProblemAttempt.id == attempt_id,
                ProblemAttempt.user_id == effective_user.id,
            )
        ).first()

        if not attempt:
            return None

        # 2. Strict precondition: only unsuccessful attempts can be refined
        if attempt.was_successful is not False:
            raise ValueError("Only unsuccessful problem attempts can be refined.")

        # 3. Combine original problem context and new details cleanly
        clean_additional_info = request.additional_information.strip()
        is_ar = self._is_arabic(attempt.user_message) or self._is_arabic(clean_additional_info)

        if is_ar:
            combined_query = (
                f"المشكلة السابقة:\n{attempt.user_message}\n\n"
                f"معلومات وتفاصيل إضافية:\n{clean_additional_info}"
            )
        else:
            combined_query = (
                f"Original problem:\n{attempt.user_message}\n\n"
                f"Additional information:\n{clean_additional_info}"
            )

        # 4. Execute the solve pipeline with parent link and effective user
        solve_request = SolveProblemRequest(
            problem_description=combined_query,
        )

        return solver_service.solve(
            db=db,
            request=solve_request,
            parent_attempt_id=attempt.id,
            user=effective_user,
        )

    def get_user_history(
        self,
        db: Session,
        user: User,
        page: int = 1,
        limit: int = 20,
    ) -> AttemptHistoryResponse:
        """Retrieve paginated problem attempts strictly belonging to the authenticated user.

        Ordered newest first (created_at DESC, id DESC). Performs a database-level
        COUNT query and a paginated SELECT query with OFFSET and LIMIT.

        Args:
            db: Active SQLAlchemy database session.
            user: Authenticated User model instance.
            page: 1-indexed page number (>= 1).
            limit: Page size limit (1 to 50).

        Returns:
            AttemptHistoryResponse: Paginated list of attempts with total count and has_next.
        """
        # 1. Database-level count for this user only
        total = db.scalar(
            select(func.count())
            .select_from(ProblemAttempt)
            .where(ProblemAttempt.user_id == user.id)
        ) or 0

        # 2. Database-level paginated query with deterministic ordering
        offset = (page - 1) * limit
        attempts = db.scalars(
            select(ProblemAttempt)
            .where(ProblemAttempt.user_id == user.id)
            .order_by(ProblemAttempt.created_at.desc(), ProblemAttempt.id.desc())
            .offset(offset)
            .limit(limit)
        ).all()

        # 3. Transform to safe response items with solution preview
        items = [
            AttemptHistoryItem(
                id=attempt.id,
                user_message=attempt.user_message,
                created_at=attempt.created_at,
                was_successful=attempt.was_successful,
                parent_attempt_id=attempt.parent_attempt_id,
                solution_preview=extract_solution_preview(attempt.ai_response),
            )
            for attempt in attempts
        ]

        has_next = (page * limit) < total

        return AttemptHistoryResponse(
            items=items,
            page=page,
            limit=limit,
            total=total,
            has_next=has_next,
        )

    def get_attempt_detail(
        self,
        db: Session,
        user: User,
        attempt_id: uuid.UUID,
    ) -> Optional[AttemptDetailResponse]:
        """Retrieve a specific problem attempt strictly belonging to the authenticated user.

        Performs a single indexed query by (id, user_id) guaranteeing ownership.
        Safely deserializes the stored LifeFixSolutionResponse without exposing
        sensitive metadata, prompts, or internal model reasoning.

        Args:
            db: Active SQLAlchemy database session.
            user: Authenticated User model instance.
            attempt_id: UUID of the target problem attempt.

        Returns:
            AttemptDetailResponse | None: Populated attempt details if found and owned by user;
            None if the attempt does not exist or belongs to another user (triggers 404).
        """
        attempt = db.scalars(
            select(ProblemAttempt).where(
                ProblemAttempt.id == attempt_id,
                ProblemAttempt.user_id == user.id,
            )
        ).first()

        if not attempt:
            return None

        # Deserialization of structured solution
        if not attempt.ai_response or not attempt.ai_response.strip():
            logger.error("Stored ai_response is empty for attempt %s", attempt.id)
            raise ValueError(f"No solution data available for attempt {attempt.id}.")

        try:
            solution = LifeFixSolutionResponse.model_validate_json(attempt.ai_response)
        except Exception as exc:
            logger.error(
                "Stored ai_response failed validation as LifeFixSolutionResponse for attempt %s: %s",
                attempt.id,
                exc,
                exc_info=True,
            )
            raise ValueError(f"Corrupted or invalid solution data for attempt {attempt.id}.") from exc

        return AttemptDetailResponse(
            id=attempt.id,
            user_message=attempt.user_message,
            created_at=attempt.created_at,
            was_successful=attempt.was_successful,
            parent_attempt_id=attempt.parent_attempt_id,
            solution=solution,
        )
