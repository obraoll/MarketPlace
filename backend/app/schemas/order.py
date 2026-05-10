"""
Schémas Pydantic pour les commandes
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional
from ..models.order import OrderStatus


class OrderItemBase(BaseModel):
    """Schéma de base pour un item de commande"""
    product_id: int
    quantity: int


class OrderItemProductResponse(BaseModel):
    id: int
    name: str
    brand: str
    price: float

    model_config = ConfigDict(from_attributes=True)


class OrderItemResponse(OrderItemBase):
    """Schéma de réponse pour un item de commande"""
    id: int
    unit_price: float
    product: Optional[OrderItemProductResponse] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    """Schéma pour créer une commande"""
    items: List[OrderItemBase]
    shipping_address: Optional[str] = None
    billing_address: Optional[str] = None
    shipping_method: Optional[str] = "standard"
    payment_method: Optional[str] = "card"
    promo_code: Optional[str] = None


class OrderFromCartCreate(BaseModel):
    shipping_address: str
    billing_address: Optional[str] = None
    shipping_method: Optional[str] = "standard"
    payment_method: Optional[str] = "card"
    promo_code: Optional[str] = None


class OrderCheckoutMetaResponse(BaseModel):
    shipping_address: str
    billing_address: str
    shipping_method: str
    shipping_cost: float
    shipping_label: Optional[str] = None
    estimated_delivery_start: Optional[str] = None
    estimated_delivery_end: Optional[str] = None
    tracking_number: Optional[str] = None
    payment_method: str
    payment_status: str
    model_config = ConfigDict(from_attributes=True)


class OrderUpdate(BaseModel):
    """Schéma pour mettre à jour une commande"""
    status: Optional[OrderStatus] = None


class OrderResponse(BaseModel):
    """Schéma de réponse pour une commande"""
    id: int
    order_number: str
    status: OrderStatus
    subtotal_amount: float
    discount_amount: float
    shipping_amount: float
    platform_fee_amount: float
    promo_code: Optional[str] = None
    total_amount: float
    customer_id: int
    seller_id: int
    items: List[OrderItemResponse]
    checkout_meta: Optional[OrderCheckoutMetaResponse] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
