"""Schémas tickets support."""
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class SupportTicketCreate(BaseModel):
    channel: str = "web"
    category: str = "general"
    priority: str = "normal"
    subject: str
    message: str


class SupportTicketUpdate(BaseModel):
    status: str
    priority: str


class SupportTicketResponse(BaseModel):
    id: int
    user_id: int
    channel: str
    category: str
    priority: str
    status: str
    subject: str
    message: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
