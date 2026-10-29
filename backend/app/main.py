from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analysis, auth
from app.core.config import settings
from app.services import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models once when the server starts, release on shutdown."""
    ml_service.load_models()
    yield
    # Nothing to clean up for scikit-learn models


app = FastAPI(
    title="TextGuard API",
    description="Spam & Sentiment Checker — college project",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow only our frontend origin (set in .env)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health():
    """Simple liveness check — no auth required."""
    return {"status": "ok"}
