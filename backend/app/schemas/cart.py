"""
Schémas Pydantic pour le panier
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class CartItemBase(BaseModel):
    """Schéma de base pour un item de panier"""
    product_id: int
    quantity: int


class CartItemCreate(CartItemBase):
    """Schéma pour ajouter un item au panier"""
    pass


class CartItemUpdate(BaseModel):
    """Schéma pour mettre à jour un item du panier"""
    quantity: int


class CartProductResponse(BaseModel):
    id: int
    name: str
    brand: str
    price: float
    stock: int

    model_config = ConfigDict(from_attributes=True)


class CartItemResponse(CartItemBase):
    """Schéma de réponse pour un item de panier"""
    id: int
    user_id: int
    product: CartProductResponse
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
