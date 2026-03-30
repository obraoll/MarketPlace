"""Schémas Q/R produit."""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class ProductQuestionCreate(BaseModel):
    product_id: int
    question: str


class ProductAnswerCreate(BaseModel):
    answer: str


class ProductQuestionResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    question: str
    answer: Optional[str] = None
    answered_by: Optional[int] = None
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
