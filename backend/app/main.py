from fastapi import Depends, FastAPI, HTTPException  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from sqlalchemy import text  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]

from app.db.database import get_db


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
            "status": "success",
            "database": "connected",
            "message": "Database connection is working successfully"
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(error)}"
        )