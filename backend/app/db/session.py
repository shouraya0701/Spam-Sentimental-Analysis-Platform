from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Single engine shared by the whole app
engine = create_engine(settings.DATABASE_URL)

# Factory for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
