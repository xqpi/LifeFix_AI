"""Seed a safe development guest user for unauthenticated problem attempts.

This script creates an idempotent, development-only guest account in PostgreSQL
so that ProblemAttempt records (which require a non-null user_id foreign key)
can be safely created and tested before full authentication is implemented.

Safety:
- No plaintext passwords are used or stored.
- No credentials or secrets are placed in source code.
- Uses a deterministic development UUID and an explicit development email.
"""

import sys
import uuid
from pathlib import Path

# Configure UTF-8 encoding for console output on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure backend directory is in Python path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.database import SessionLocal
from app.models.user import User

# Deterministic development guest identity
GUEST_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
GUEST_USER_EMAIL = "guest@lifefix.local"
GUEST_USER_NAME = "LifeFix Development Guest"
# Safe disabled account placeholder (not a plaintext password; prevents authentication)
DISABLED_PASSWORD_HASH = "!DISABLED_DEVELOPMENT_ACCOUNT_NO_LOGIN!"


def seed_development_user() -> dict:
    """Idempotently seed the development guest user.

    Returns:
        dict: Seeding statistics (user_created: bool, user_id: str).
    """
    db = SessionLocal()
    stats = {
        "user_created": False,
        "user_id": str(GUEST_USER_ID),
        "email": GUEST_USER_EMAIL,
    }

    try:
        print("=== Step 8.1: Seeding Development Guest User ===")

        # Check for existing user by deterministic ID or email
        existing_user = db.scalars(
            select(User).where(
                (User.id == GUEST_USER_ID) | (User.email == GUEST_USER_EMAIL)
            )
        ).first()

        if existing_user:
            print(f"Guest user already exists: ID={existing_user.id}, Email={existing_user.email}")
            stats["user_id"] = str(existing_user.id)
            stats["user_created"] = False
        else:
            guest_user = User(
                id=GUEST_USER_ID,
                name=GUEST_USER_NAME,
                email=GUEST_USER_EMAIL,
                password_hash=DISABLED_PASSWORD_HASH,
                role="guest",
            )
            db.add(guest_user)
            db.commit()
            stats["user_created"] = True
            print(f"Created development guest user: ID={guest_user.id}, Email={guest_user.email}")

        return stats

    except Exception as exc:
        db.rollback()
        print(f"Error during development user seeding: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_development_user()
