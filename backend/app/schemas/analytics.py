"""
Schémas analytics
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any


class AnalyticsEventCreate(BaseModel):
    event_type: str
    product_id: Optional[int] = None
    order_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class SellerAnalyticsSummary(BaseModel):
    product_views: int
    add_to_cart: int
    checkout_started: int
    order_completed: int
