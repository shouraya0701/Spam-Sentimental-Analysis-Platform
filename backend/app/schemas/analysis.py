from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    text: str = Field(..., max_length=5000, description="Text to analyse (max 5000 chars)")

    @field_validator("text")
    @classmethod
    def text_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Text cannot be empty or whitespace only")
        return v


class AnalysisResponse(BaseModel):
    id: int
    input_text: str
    spam_label: str
    spam_confidence: float
    sentiment_label: str
    sentiment_confidence: float
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryResponse(BaseModel):
    items: list[AnalysisResponse]
    total: int
    limit: int
    offset: int


class DailyCount(BaseModel):
    date: str   # "YYYY-MM-DD"
    count: int


class StatsResponse(BaseModel):
    total_analyses: int
    spam_count: int
    ham_count: int
    positive_count: int
    negative_count: int
    daily_counts: list[DailyCount]
