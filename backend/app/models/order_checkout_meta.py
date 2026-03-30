"""Métadonnées checkout liées à une commande."""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..core.database import Base


class OrderCheckoutMeta(Base):
    __tablename__ = "order_checkout_meta"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True, index=True)
    shipping_address = Column(String(500), nullable=False)
    billing_address = Column(String(500), nullable=False)
    shipping_method = Column(String(50), nullable=False, default="standard")
    shipping_cost = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String(50), nullable=False, default="card")
    payment_status = Column(String(50), nullable=False, default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="checkout_meta")
