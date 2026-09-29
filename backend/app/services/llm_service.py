"""Service responsible solely for LLM communication with Google Gemini via the Google GenAI SDK."""

import os
from typing import Optional

from google import genai
from google.genai import types

from app.core.config import get_gemini_api_key
from app.schemas.solver import LifeFixSolutionResponse


class LLMServiceError(RuntimeError):
    """Raised when an error occurs during LLM generation."""
    pass


class LLMService:
    """Encapsulates direct communication with Google Gemini for structured output generation."""

    # Default to Gemini 3.8 Flash as recommended by Google GenAI, allow override via environment variable
    DEFAULT_MODEL: str = "gemini-3.8-flash"
    DEFAULT_TIMEOUT_SECONDS: float = 30.0
    DEFAULT_TEMPERATURE: float = 0.2

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT_SECONDS,
        temperature: float = DEFAULT_TEMPERATURE,
    ) -> None:
        """Initialize LLMService with Google GenAI client.

        Raises:
            ValueError: If GEMINI_API_KEY is not configured or empty.
        """
        # Retrieve key via config helper (never hardcoded, fails clearly if missing)
        self._api_key = api_key or get_gemini_api_key()
        self.model = model or os.getenv("GEMINI_MODEL", self.DEFAULT_MODEL)
        self.timeout = timeout
        self.temperature = temperature

        # Initialize the official Google GenAI client
        self.client = genai.Client(
            api_key=self._api_key,
            http_options=types.HttpOptions(timeout=self.timeout),
        )

    def generate_solution(
        self,
        prompt: str,
        system_instruction: str,
    ) -> LifeFixSolutionResponse:
        """Generate a validated structured LifeFixSolutionResponse from Gemini.

        Args:
            prompt: Formatted user query and retrieved context prompt.
            system_instruction: System persona and behavioral constraints.

        Returns:
            LifeFixSolutionResponse: Validated Pydantic solution schema.

        Raises:
            LLMServiceError: If Gemini API fails, times out, or returns invalid data.
        """
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=LifeFixSolutionResponse,
                temperature=self.temperature,
            )

            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config,
            )

            raw_text = response.text
            if not raw_text or not raw_text.strip():
                raise LLMServiceError("Gemini returned an empty response.")

            # Validate against our Pydantic schema
            return LifeFixSolutionResponse.model_validate_json(raw_text)

        except Exception as exc:
            # Cleanly wrap errors without leaking secrets or raw provider internals
            error_type = type(exc).__name__
            raise LLMServiceError(f"Gemini LLM generation failed ({error_type}).") from exc
