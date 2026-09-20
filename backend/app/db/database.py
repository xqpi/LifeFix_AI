from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import DATABASE_URL

# 1. Create the SQLAlchemy engine using the database connection URL
engine = create_engine(DATABASE_URL)

# 2. Create a session factory to generate database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# 3. Base class for declarative database models
class Base(DeclarativeBase):
    pass


# 4. Dependency to get a database session per request and close it safely
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
