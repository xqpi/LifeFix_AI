"""Pydantic schemas for the AI problem solving request and structured solution response."""

from pydantic import BaseModel, Field, field_validator


class LifeFixSolutionStep(BaseModel):
    """Structured representation of an individual solution step."""

    step_number: int = Field(ge=1, description="Sequential step number starting at 1")
    title: str = Field(min_length=1, description="Actionable title for this step")
    instruction: str = Field(min_length=1, description="Detailed actionable instruction")
    difficulty: str = Field(min_length=1, description="Difficulty level (e.g. easy, medium, hard)")
    estimated_time_minutes: int = Field(ge=0, description="Estimated time in minutes (>= 0)")

    @field_validator("title", "instruction", "difficulty")
    @classmethod
    def validate_non_empty_string(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or contain only whitespace.")
        return v.strip()


class LifeFixSourceCase(BaseModel):
    """Reference to a retrieved LifeFix problem case from the knowledge base."""

    problem_id: str = Field(min_length=1, description="UUID of the retrieved problem")
    title: str = Field(min_length=1, description="Title of the retrieved problem")

    @field_validator("problem_id", "title")
    @classmethod
    def validate_non_empty_string(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or contain only whitespace.")
        return v.strip()


class LifeFixSolutionResponse(BaseModel):
    """Structured LifeFix solution response produced by AI problem solving or RAG fallback."""

    attempt_id: str = Field(default="", description="UUID of the persisted problem attempt record")
    understanding: str = Field(min_length=1, description="Empathetic, clear summary of the user's issue")
    possible_causes: list[str] = Field(default_factory=list, description="Likely contributing causes or factors")
    recommended_steps: list[LifeFixSolutionStep] = Field(
        min_length=1,
        description="Sequential, actionable steps to solve the issue (must not be empty for a valid solution)",
    )
    explanations: list[str] = Field(default_factory=list, description="Why these steps resolve the issue")
    warnings_or_notes: list[str] = Field(
        default_factory=list,
        description="Safety notes, practical precautions, or fallback indicators",
    )
    follow_up_question: str | None = Field(
        default=None,
        description="Optional clarifying question if key information is missing",
    )
    source_cases: list[LifeFixSourceCase] = Field(
        default_factory=list,
        description="Retrieved problem cases that informed the solution",
    )

    @field_validator("understanding")
    @classmethod
    def validate_understanding(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Understanding cannot be empty or contain only whitespace.")
        return v.strip()


class SolveProblemRequest(BaseModel):
    """User request payload for AI problem solving."""

    problem_description: str = Field(..., description="User's natural language description of their problem")
    category_hint: str | None = Field(default=None, description="Optional category hint (e.g. Technology, Home & Living)")

    @field_validator("problem_description")
    @classmethod
    def validate_problem_description(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("problem_description must be a string.")
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("problem_description cannot be empty or contain only whitespace.")
        return cleaned

    @field_validator("category_hint")
    @classmethod
    def validate_category_hint(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip()
        return cleaned if cleaned else None


class AttemptFeedbackRequest(BaseModel):
    """User feedback payload for an existing ProblemAttempt."""

    was_successful: bool = Field(..., description="Whether the recommended solution solved the user's problem")
    rating: int | None = Field(default=None, ge=1, le=5, description="Optional satisfaction rating between 1 and 5")
    comment: str | None = Field(default=None, description="Optional qualitative feedback or explanation")

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip()
        return cleaned if cleaned else None


class AttemptFeedbackResponse(BaseModel):
    """Response returned upon successfully recording feedback for a ProblemAttempt."""

    attempt_id: str = Field(description="UUID of the problem attempt")
    was_successful: bool = Field(description="Whether the attempt successfully solved the problem")
    feedback_recorded: bool = Field(description="Whether detailed feedback (rating/comment) was recorded")
    message: str = Field(description="User-facing confirmation message")


class RefineProblemRequest(BaseModel):
    """User request payload for refining an unsuccessful problem attempt."""

    additional_information: str = Field(..., description="Additional context or details to refine the solution")

    @field_validator("additional_information")
    @classmethod
    def validate_additional_information(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("additional_information must be a string.")
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("additional_information cannot be empty or contain only whitespace.")
        return cleaned
