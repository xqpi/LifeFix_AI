"""Domain service for user registration, credential verification, and session token generation."""

import logging
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

logger = logging.getLogger(__name__)


class AuthServiceError(Exception):
    """Base exception for authentication service errors."""


class UserAlreadyExistsError(AuthServiceError):
    """Raised when registering an email that already exists in the system."""


class InvalidCredentialsError(AuthServiceError):
    """Raised when login credentials fail authentication."""


class AuthService:
    """Manages user registration, credential authentication, and JWT lifecycle."""

    def register_user(self, db: Session, request: UserRegisterRequest) -> User:
        """Register a new user account with secure password hashing.

        Args:
            db: Active SQLAlchemy database session.
            request: Validated registration request.

        Returns:
            User: Newly created and committed User model instance.

        Raises:
            UserAlreadyExistsError: If the normalized email is already in use.
        """
        normalized_email = request.email.strip().lower()

        # Check for duplicate email
        existing_user = db.scalars(
            select(User).where(User.email == normalized_email)
        ).first()

        if existing_user:
            logger.info("Registration rejected: email '%s' already exists.", normalized_email)
            raise UserAlreadyExistsError("An account with this email already exists.")

        # Hash password securely
        hashed_password = hash_password(request.password)

        new_user = User(
            name=request.name.strip(),
            email=normalized_email,
            password_hash=hashed_password,
            role="user",
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info("Successfully registered user id=%s with email=%s", new_user.id, new_user.email)
        return new_user

    def authenticate_user(self, db: Session, request: UserLoginRequest) -> User:
        """Authenticate user credentials against stored bcrypt hash.

        Args:
            db: Active SQLAlchemy database session.
            request: Validated login request containing email and password.

        Returns:
            User: Authenticated User model instance.

        Raises:
            InvalidCredentialsError: If email not found or password does not match.
        """
        normalized_email = request.email.strip().lower()

        user = db.scalars(
            select(User).where(User.email == normalized_email)
        ).first()

        if not user or not verify_password(request.password, user.password_hash):
            logger.warning("Failed authentication attempt for email: %s", normalized_email)
            raise InvalidCredentialsError("Invalid email or password.")

        return user

    def create_token_response(self, user: User) -> TokenResponse:
        """Generate a signed JWT access token for an authenticated user.

        Args:
            user: Authenticated User instance.

        Returns:
            TokenResponse: Access token, token type, and safe user profile.
        """
        token = create_access_token(
            subject=user.id,
            email=user.email,
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
