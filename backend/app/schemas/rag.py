"""Pydantic schemas for RAG context retrieval and LLM context preparation."""

from pydantic import BaseModel, Field


class RAGSolutionContext(BaseModel):
    """Structured solution step representation for RAG context."""

    solution_id: str = Field(description="Unique identifier of the solution step")
    title: str = Field(description="Title of the solution step")
    solution_text: str = Field(description="Detailed instructions or steps for the solution")
    step_number: int = Field(description="Order index of this solution step")
    difficulty: str | None = Field(default=None, description="Difficulty level of the step")
    estimated_time_minutes: int | None = Field(
        default=None, description="Estimated time in minutes to complete this step"
    )


class RAGProblemContext(BaseModel):
    """Structured problem representation with similarity score and associated solutions."""

    problem_id: str = Field(description="Unique identifier of the problem")
    title: str = Field(description="Title of the problem")
    description: str = Field(description="Detailed description of the problem")
    category: str = Field(description="Category name of the problem")
    similarity_score: float = Field(
        description="Cosine similarity score (1.0 - cosine_distance)"
    )
    rank: int = Field(description="1-based ranking position from semantic search")
    solutions: list[RAGSolutionContext] = Field(
        default_factory=list,
        description="Ordered list of solution steps associated with this problem",
    )


class RAGContextResponse(BaseModel):
    """Overall response containing user query and retrieved problems with solutions."""

    query: str = Field(description="The user's original query")
    top_k: int = Field(description="Number of top problems requested")
    retrieved_problems: list[RAGProblemContext] = Field(
        description="Ranked list of problems with their solutions for RAG context"
    )
