"""Core security and cryptographic utilities for LifeFix authentication.

Provides secure password hashing via bcrypt and RFC 7519 JSON Web Token (JWT)
encoding and validation.
"""

from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Optional
import uuid

import bcrypt
import jwt

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    get_jwt_secret_key,
)

logger = logging.getLogger(__name__)


class SecurityError(Exception):
    """Base exception for security operations."""


class TokenExpiredError(SecurityError):
    """Raised when an access token has expired."""


class InvalidTokenError(SecurityError):
    """Raised when an access token is invalid or malformed."""


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with 12 salt rounds.

    Args:
        password: The plain text password to hash.

    Returns:
        str: The bcrypt password hash.

    Raises:
        ValueError: If password is empty or exceeds bcrypt's 72-byte limit.
    """
    if not password:
        raise ValueError("Password cannot be empty.")
    
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError("Password exceeds maximum allowed length of 72 bytes.")
    
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a bcrypt hash in constant time.

    Args:
        plain_password: The candidate password.
        hashed_password: The stored bcrypt hash.

    Returns:
        bool: True if candidate matches hash; False otherwise.
    """
    if not plain_password or not hashed_password:
        return False
    
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError) as exc:
        logger.warning("Password verification failed with invalid hash format: %s", exc)
        return False


def create_access_token(
    subject: str | uuid.UUID,
    email: str,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict[str, Any]] = None,
) -> str:
    """Create a signed JWT access token.

    Args:
        subject: The subject identity (typically user UUID).
        email: The user's primary email address.
        expires_delta: Optional custom token lifespan. Defaults to config setting.
        extra_claims: Optional additional payload attributes.

    Returns:
        str: Encoded, signed JWT string.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: dict[str, Any] = {
        "sub": str(subject),
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    if extra_claims:
        payload.update(extra_claims)

    secret_key = get_jwt_secret_key()
    return jwt.encode(payload, secret_key, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token.

    Args:
        token: The encoded JWT token string.

    Returns:
        dict: The verified token claims payload.

    Raises:
        TokenExpiredError: If token has expired.
        InvalidTokenError: If signature, algorithm, or claims are invalid.
        ValueError: If JWT_SECRET_KEY is missing, empty, or shorter than 32 bytes.
    """
    secret_key = get_jwt_secret_key()
    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp", "iat"]},
        )
        return payload
    except jwt.ExpiredSignatureError as exc:
        raise TokenExpiredError("Token has expired.") from exc
    except (jwt.PyJWTError, ValueError) as exc:
        raise InvalidTokenError("Could not validate credentials.") from exc

