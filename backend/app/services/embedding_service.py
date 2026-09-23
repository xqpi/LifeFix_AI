import math
from typing import ClassVar, Optional

import numpy as np
from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """Service for generating dense vector embeddings using intfloat/multilingual-e5-small.

    Design details:
    1. Single Model Instance per Process:
       Loading a transformer model into memory is computationally expensive (~470MB of weights,
       tokenizers, and PyTorch computation graph). Loading it once and caching it as a process-level
       singleton prevents massive memory waste, eliminates per-request disk/model I/O latency, and
       guarantees predictable, fast inference times.

    2. Asymmetric E5 Prefixes ('query: ' vs 'passage: '):
       The multilingual-e5 family of models is trained as an asymmetric bi-encoder for dense retrieval.
       In asymmetric retrieval, search queries (short user intents) and passages (longer descriptive texts)
       occupy complementary semantic roles. Prepending 'query: ' instructs the model to encode an information-seeking
       representation, whereas prepending 'passage: ' instructs it to encode an informational/document representation.
       Omitting or swapping these prefixes degrades semantic similarity accuracy.

    3. L2-Normalized Embeddings:
       The model generates vectors where ||v||_2 = 1.0 (unit vectors).
       Normalized embeddings simplify similarity search because cosine similarity between two unit vectors
       is mathematically equivalent to their dot product (inner product):
           cosine_similarity(u, v) = u · v
       In vector databases like PostgreSQL + pgvector, this enables both cosine distance (<=>) and inner product (<#>)
       to operate accurately and efficiently without requiring runtime normalization in database queries.
    """

    MODEL_NAME: ClassVar[str] = "intfloat/multilingual-e5-small"
    EMBEDDING_DIM: ClassVar[int] = 384

    # Class-level model cache to ensure single load per process
    _model: ClassVar[Optional[SentenceTransformer]] = None

    @classmethod
    def get_model(cls) -> SentenceTransformer:
        """Retrieve or lazily initialize the shared SentenceTransformer model instance.

        The model is loaded once per process and reused across all service calls.
        """
        if cls._model is None:
            cls._model = SentenceTransformer(cls.MODEL_NAME)
        return cls._model

    @staticmethod
    def _validate_text(text: str) -> str:
        """Validate that input text is a non-empty string not composed solely of whitespace.

        Raises:
            ValueError: If input is not a string, is empty, or consists solely of whitespace.
        """
        if not isinstance(text, str):
            raise ValueError(f"Input text must be a string, got {type(text).__name__}.")
        stripped = text.strip()
        if not stripped:
            raise ValueError("Input text cannot be empty or contain only whitespace.")
        return stripped

    def embed_query(self, text: str) -> list[float]:
        """Generate a 384-dimensional normalized embedding for a search query.

        Input is prefixed with 'query: ' according to E5 model requirements.

        Args:
            text: The user query string (e.g., search text).

        Returns:
            list[float]: A 384-element list of floats with unit L2 norm,
                         compatible with SQLAlchemy pgvector Vector(384).

        Raises:
            ValueError: If text is empty or contains only whitespace.
        """
        clean_text = self._validate_text(text)
        model = self.get_model()

        # E5 requires 'query: ' prefix for search queries
        formatted_text = f"query: {clean_text}"

        # normalize_embeddings=True produces unit length vectors (L2 norm = 1.0)
        embedding = model.encode(
            formatted_text,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        return embedding.tolist()

    def embed_passage(self, text: str) -> list[float]:
        """Generate a 384-dimensional normalized embedding for a stored passage or problem.

        Input is prefixed with 'passage: ' according to E5 model requirements.

        Args:
            text: The passage or problem content to embed.

        Returns:
            list[float]: A 384-element list of floats with unit L2 norm,
                         compatible with SQLAlchemy pgvector Vector(384).

        Raises:
            ValueError: If text is empty or contains only whitespace.
        """
        clean_text = self._validate_text(text)
        model = self.get_model()

        # E5 requires 'passage: ' prefix for documents and stored problem records
        formatted_text = f"passage: {clean_text}"

        # normalize_embeddings=True produces unit length vectors (L2 norm = 1.0)
        embedding = model.encode(
            formatted_text,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        return embedding.tolist()
