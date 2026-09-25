"""Pydantic schemas for authentication requests, responses, and user profiles."""

from datetime import datetime
import re
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)+$")


class UserRegisterRequest(BaseModel):
    """Payload for registering a new LifeFix user account."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name or display name of the user",
    )
    email: str = Field(
        ...,
        max_length=255,
        description="Unique email address",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="Account password (8-72 characters)",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        clean = value.strip()
        if len(clean) < 2:
            raise ValueError("Name must be at least 2 characters long.")
        return clean

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        clean = value.strip().lower()
        if not clean:
            raise ValueError("Email cannot be empty.")
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email format.")
        return clean

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password cannot exceed 72 bytes.")
        return value


class UserLoginRequest(BaseModel):
    """Payload for logging into an existing LifeFix user account."""

    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    """Safe public representation of a LifeFix user (excluding password hash)."""

    id: uuid.UUID
    name: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Bearer access token and authenticated user profile."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
