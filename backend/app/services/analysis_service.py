"""
Business logic for creating analyses, fetching history, deleting, and stats.
All queries are filtered by user_id — a user never sees another user's data.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import Date, cast, func
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.user import User
from app.services.ml_service import predict


def create_analysis(db: Session, user: User, text: str) -> Analysis:
    """Run ML prediction and save the result row."""
    result = predict(text)

    analysis = Analysis(
        user_id=user.id,
        input_text=text,
        spam_label=result["spam_label"],
        spam_confidence=result["spam_confidence"],
        sentiment_label=result["sentiment_label"],
        sentiment_confidence=result["sentiment_confidence"],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


def get_history(
    db: Session, user_id: int, limit: int, offset: int
) -> tuple[list[Analysis], int]:
    """Return a paginated list and total count, newest first."""
    total = (
        db.query(func.count(Analysis.id))
        .filter(Analysis.user_id == user_id)
        .scalar()
    )
    items = (
        db.query(Analysis)
        .filter(Analysis.user_id == user_id)
        .order_by(Analysis.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def delete_analysis(db: Session, analysis_id: int, user_id: int) -> bool:
    """Delete an analysis only if it belongs to this user. Returns True if deleted."""
    row = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == user_id)
        .first()
    )
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True


def get_stats(db: Session, user_id: int) -> dict:
    """Compute aggregate stats with SQL (no Python-level loops over rows)."""
    base = db.query(func.count(Analysis.id)).filter(Analysis.user_id == user_id)

    total = base.scalar()
    spam_count = base.filter(Analysis.spam_label == "SPAM").scalar()
    ham_count = base.filter(Analysis.spam_label == "HAM").scalar()
    positive_count = base.filter(Analysis.sentiment_label == "POSITIVE").scalar()
    negative_count = base.filter(Analysis.sentiment_label == "NEGATIVE").scalar()

    # Last 7 calendar days (UTC), oldest first
    today = datetime.now(timezone.utc).date()
    seven_days_ago = today - timedelta(days=6)

    created_date = cast(Analysis.created_at, Date)
    daily_rows = (
        db.query(
            created_date.label("date"),
            func.count(Analysis.id).label("count"),
        )
        .filter(
            Analysis.user_id == user_id,
            created_date >= seven_days_ago,
        )
        .group_by(created_date)
        .all()
    )

    daily_dict = {str(row.date): row.count for row in daily_rows}

    daily_counts = [
        {"date": str(today - timedelta(days=i)), "count": daily_dict.get(str(today - timedelta(days=i)), 0)}
        for i in range(6, -1, -1)
    ]

    return {
        "total_analyses": total,
        "spam_count": spam_count,
        "ham_count": ham_count,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "daily_counts": daily_counts,
    }
