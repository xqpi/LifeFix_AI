from fastapi import Depends, FastAPI, HTTPException, Query  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from sqlalchemy import text  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]

from app.db.database import get_db
from app.schemas.rag import RAGContextResponse
from app.schemas.search import SearchResponse
from app.schemas.solver import LifeFixSolutionResponse, SolveProblemRequest
from app.services.problem_solver_service import ProblemSolverService
from app.services.rag_context_service import RAGContextService
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


rag_context_service = RAGContextService(search_service=search_service)


@app.get("/api/search/context", response_model=RAGContextResponse)
def get_search_rag_context(
    q: str = Query(..., description="Natural language problem query"),
    top_k: int = Query(default=5, ge=1, le=20, description="Top K results to return (1-20)"),
    db: Session = Depends(get_db),
):
    """Retrieve top-K matching problems with their associated solutions structured for RAG context."""
    if not q or not q.strip():
        raise HTTPException(
            status_code=400,
            detail="Query text cannot be empty or contain only whitespace.",
        )
    try:
        return rag_context_service.build_context(db=db, query=q, top_k=top_k)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while building RAG context.",
        )


problem_solver_service = ProblemSolverService(rag_context_service=rag_context_service)


@app.post("/api/solve", response_model=LifeFixSolutionResponse)
def solve_problem(
    payload: SolveProblemRequest,
    db: Session = Depends(get_db),
):
    """Generate a structured, grounded LifeFix solution for a user's problem."""
    try:
        return problem_solver_service.solve(db=db, request=payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while solving the problem.",
        )
