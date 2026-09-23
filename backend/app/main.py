from fastapi import Depends, FastAPI, HTTPException, Query  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from sqlalchemy import text  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]

from app.db.database import get_db
from app.schemas.search import SearchResponse
from app.services.semantic_search_service import SemanticSearchService


app = FastAPI(
    title="LifeFix API",
    description="AI-powered personal problem solving platform",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


@app.get("/")
def root():

    return {
        "message": "Welcome to LifeFix API"
    }


@app.get("/api/health/database")
def check_database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "database": "connected"
        }
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )


search_service = SemanticSearchService()


@app.get("/api/search", response_model=SearchResponse)
def search_problems(
    q: str = Query(..., description="Natural language problem query"),
    top_k: int = Query(default=5, ge=1, le=20, description="Top K results to return (1-20)"),
    db: Session = Depends(get_db),
):
    """Semantic search endpoint returning top-K problems matching a natural language query."""
    if not q or not q.strip():
        raise HTTPException(
            status_code=400,
            detail="Query text cannot be empty or contain only whitespace.",
        )
    try:
        results = search_service.search_problems(db=db, query=q, top_k=top_k)
        return SearchResponse(
            query=q.strip(),
            top_k=top_k,
            results=results,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
