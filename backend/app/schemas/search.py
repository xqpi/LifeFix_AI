from pydantic import BaseModel, Field


class SearchResultItem(BaseModel):
    """Schema representing an individual retrieved problem with similarity score and rank."""

    problem_id: str = Field(description="Unique identifier of the problem")
    title: str = Field(description="Title of the problem")
    description: str = Field(description="Detailed description of the problem")
    category: str = Field(description="Name of the category to which the problem belongs")
    similarity_score: float = Field(
        description="Cosine similarity score between query and problem embedding (1.0 - distance)"
    )
    rank: int = Field(description="1-based rank position in retrieval results")


class SearchResponse(BaseModel):
    """Schema representing the overall response for a semantic search query."""

    query: str = Field(description="The user's search query")
    top_k: int = Field(description="The number of results requested")
    results: list[SearchResultItem] = Field(
        description="Ordered list of top matching problems (highest similarity first)"
    )
