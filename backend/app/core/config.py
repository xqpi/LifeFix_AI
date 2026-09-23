import os
from pathlib import Path
from dotenv import load_dotenv

# Locate the root .env file: LifeFix/.env
# config.py is located at backend/app/core/config.py, so we go up 4 levels to reach the project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

# Load environment variables from the root .env file
load_dotenv(dotenv_path=ENV_PATH)

# Read database credentials
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")

# Validate that all required variables are set
missing_vars = [
    var_name
    for var_name, value in [
        ("POSTGRES_USER", POSTGRES_USER),
        ("POSTGRES_PASSWORD", POSTGRES_PASSWORD),
        ("POSTGRES_DB", POSTGRES_DB),
    ]
    if not value
]

if missing_vars:
    raise ValueError(
        f"Missing required database environment variable(s): {', '.join(missing_vars)}. "
        f"Please ensure they are defined in: {ENV_PATH}"
    )

# Build SQLAlchemy connection URL using psycopg 3
DATABASE_URL = f"postgresql+psycopg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:5432/{POSTGRES_DB}"

# Gemini LLM configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def get_gemini_api_key() -> str:
    """Return the configured GEMINI_API_KEY or raise ValueError if missing or empty.

    This ensures database and other services can start without requiring GEMINI_API_KEY,
    while LLM initialization fails clearly when the key is missing.
    """
    key = os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY
    if not key or not key.strip():
        raise ValueError(
            "GEMINI_API_KEY is not set or empty. "
            f"Please ensure GEMINI_API_KEY is defined in: {ENV_PATH}"
        )
    return key.strip()
