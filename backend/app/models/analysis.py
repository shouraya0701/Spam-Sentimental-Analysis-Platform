from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Analysis(Base):
    __tablename__ = "analyses"
    __table_args__ = (
        CheckConstraint("spam_label IN ('SPAM', 'HAM')", name="ck_spam_label"),
        CheckConstraint(
            "sentiment_label IN ('POSITIVE', 'NEGATIVE')", name="ck_sentiment_label"
        ),
        Index("ix_analyses_user_id", "user_id"),
        Index("ix_analyses_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    spam_label: Mapped[str] = mapped_column(String(10), nullable=False)
    spam_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    sentiment_label: Mapped[str] = mapped_column(String(10), nullable=False)
    sentiment_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="analyses")
