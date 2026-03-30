"""Schémas avis."""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class ReviewCreate(BaseModel):
    order_id: int
    product_id: int
    rating: int
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    customer_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
