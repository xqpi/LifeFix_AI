"""FastAPI authentication dependencies for LifeFix API endpoints."""

import logging
import uuid
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import (
    InvalidTokenError,
    TokenExpiredError,
    decode_access_token,
)
from app.db.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

# Standard HTTP Bearer scheme
bearer_scheme = HTTPBearer(auto_error=True)
optional_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validate JWT access token and retrieve the active authenticated User.

    Args:
        credentials: Bearer token extracted from HTTP Authorization header.
        db: Active SQLAlchemy database session.

    Returns:
        User: Database model of the authenticated user.

    Raises:
        HTTPException 401: If token is expired, invalid, or user does not exist.
    """
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except TokenExpiredError as exc:
        logger.info("Access token expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except InvalidTokenError as exc:
        logger.warning("Access token validation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_uuid = uuid.UUID(str(sub))
    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = db.get(User, user_uuid)
    if user is None:
        logger.warning("Authenticated token subject user_id=%s not found in database.", user_uuid)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Optionally resolve authenticated user if Bearer header is present.

    Returns None if no Authorization header was provided (unauthenticated).
    If an Authorization header is provided, it validates the token and raises
    HTTPException 401 if invalid or expired, preventing silent guest fallback.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return get_current_user(credentials=credentials, db=db)
