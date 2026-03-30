"""
Modèles pour les commandes
"""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from ..core.database import Base


class OrderStatus(str, enum.Enum):
    """Statuts de commande"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base):
    """Modèle commande"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    subtotal_amount = Column(Float, nullable=False, default=0.0)
    discount_amount = Column(Float, nullable=False, default=0.0)
    shipping_amount = Column(Float, nullable=False, default=0.0)
    platform_fee_amount = Column(Float, nullable=False, default=0.0)
    promo_code = Column(String(50), nullable=True)
    total_amount = Column(Float, nullable=False)
    
    # Relations
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    seller = relationship("User", foreign_keys=[seller_id])
    
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    checkout_meta = relationship("OrderCheckoutMeta", back_populates="order", uselist=False, cascade="all, delete-orphan")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<Order {self.order_number} - {self.status}>"


class OrderItem(Base):
    """Modèle item de commande"""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    
    # Relations
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    order = relationship("Order", back_populates="items")
    
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product = relationship("Product", back_populates="order_items")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<OrderItem {self.product_id} x{self.quantity}>"
