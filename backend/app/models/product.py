"""
Modèle produit
"""
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from ..core.database import Base


class ProductCondition(str, enum.Enum):
    """État du produit"""
    EXCELLENT = "excellent"
    BON = "bon"
    CORRECT = "correct"


class ProductCategory(str, enum.Enum):
    """Catégories de produits"""
    SMARTPHONE = "smartphone"
    ORDINATEUR = "ordinateur"
    TABLETTE = "tablette"
    MONTRE = "montre"
    ECOUTEURS = "ecouteurs"
    CONSOLE = "console"
    AUTRE = "autre"


class Product(Base):
    """Modèle produit"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(191), nullable=False, index=True)
    brand = Column(String(100), nullable=False)
    category = Column(SQLEnum(ProductCategory), nullable=False, index=True)
    condition = Column(SQLEnum(ProductCondition), nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    description = Column(Text)
    specifications = Column(Text)  # JSON string
    image_url = Column(String(500))
    image_urls = Column(Text)  # JSON string: ["url1", "url2"]
    variants = Column(Text)  # JSON string: [{name, value, extra_price}]
    badge = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relations
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller = relationship("User", back_populates="products")
    
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<Product {self.name} - {self.price}€>"
