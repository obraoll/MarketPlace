"""Schémas support et retours."""
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class SupportMessageCreate(BaseModel):
    order_id: int
    subject: str
    message: str


class SupportMessageResponse(BaseModel):
    id: int
    order_id: int
    sender_id: int
    recipient_id: int
    subject: str
    message: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ReturnRequestCreate(BaseModel):
    order_id: int
    reason: str


class ReturnRequestResponse(BaseModel):
    id: int
    order_id: int
    customer_id: int
    reason: str
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
