from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.analysis import (
    AnalyzeRequest,
    AnalysisResponse,
    HistoryResponse,
    StatsResponse,
)
from app.services import analysis_service

router = APIRouter(tags=["Analysis"])


@router.post("/analyze", response_model=AnalysisResponse, status_code=201)
def analyze(
    data: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run spam + sentiment analysis and save the result."""
    try:
        result = analysis_service.create_analysis(db, current_user, data.text)
    except RuntimeError as exc:
        # Models not loaded yet — tell the user to run train.py
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        )
    return result


@router.get("/history", response_model=HistoryResponse)
def history(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's analysis history, newest first."""
    items, total = analysis_service.get_history(db, current_user.id, limit, offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.delete("/history/{analysis_id}", status_code=204)
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an analysis by id.
    Returns 404 whether the row does not exist OR belongs to another user
    (so ownership is not leaked).
    """
    deleted = analysis_service.delete_analysis(db, analysis_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found"
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/stats", response_model=StatsResponse)
def stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregate stats for the current user only."""
    return analysis_service.get_stats(db, current_user.id)
