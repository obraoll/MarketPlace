"""Schémas codes promo."""
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PromoCodeCreate(BaseModel):
    code: str
    discount_percent: float
    max_uses: int = 0


class PromoCodeResponse(BaseModel):
    id: int
    code: str
    discount_percent: float
    is_active: bool
    max_uses: int
    used_count: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
