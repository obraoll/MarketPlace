"""
Schémas Pydantic pour les produits
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from ..models.product import ProductCondition, ProductCategory


class ProductBase(BaseModel):
    """Schéma de base produit"""
    name: str
    brand: str
    category: ProductCategory
    condition: ProductCondition
    price: float
    stock: int
    description: Optional[str] = None
    specifications: Optional[str] = None
    image_url: Optional[str] = None
    image_urls: Optional[List[str]] = None
    variants: Optional[List[dict]] = None
    badge: Optional[str] = None


class ProductCreate(ProductBase):
    """Schéma pour créer un produit"""
    pass


class ProductUpdate(BaseModel):
    """Schéma pour mettre à jour un produit"""
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[ProductCategory] = None
    condition: Optional[ProductCondition] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    description: Optional[str] = None
    specifications: Optional[str] = None
    image_url: Optional[str] = None
    image_urls: Optional[List[str]] = None
    variants: Optional[List[dict]] = None
    badge: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    """Schéma de réponse produit"""
    id: int
    seller_id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AIDescriptionRequest(BaseModel):
    """Schéma pour générer une description avec IA"""
    name: str
    brand: str
    category: ProductCategory
    condition: ProductCondition
    specifications: Optional[str] = None


class AIDescriptionResponse(BaseModel):
    """Schéma de réponse pour la description générée"""
    description: str
    provider: str
