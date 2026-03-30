"""
Routes pour les produits
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import logging
import json
from ..core.database import get_db
from ..core.dependencies import get_current_user, get_current_vendeur
from ..models import Product, User, ProductCategory, ProductCondition
from ..schemas import ProductCreate, ProductUpdate, ProductResponse, AIDescriptionRequest, AIDescriptionResponse
from ..services import ai_service
from ..core.config import settings
from ..utils.permissions import check_product_ownership

router = APIRouter(prefix="/products", tags=["Produits"])
logger = logging.getLogger(__name__)

def serialize_product(product: Product) -> dict:
    data = {
        "id": product.id,
        "name": product.name,
        "brand": product.brand,
        "category": product.category,
        "condition": product.condition,
        "price": product.price,
        "stock": product.stock,
        "description": product.description,
        "specifications": product.specifications,
        "image_url": product.image_url,
        "seller_id": product.seller_id,
        "is_active": product.is_active,
        "created_at": product.created_at,
        "badge": product.badge,
        "image_urls": [],
        "variants": [],
    }
    try:
        parsed_images = json.loads(product.image_urls) if product.image_urls else []
        data["image_urls"] = parsed_images if isinstance(parsed_images, list) else []
    except Exception:
        data["image_urls"] = []
    try:
        parsed_variants = json.loads(product.variants) if product.variants else []
        data["variants"] = parsed_variants if isinstance(parsed_variants, list) else []
    except Exception:
        data["variants"] = []
    return data

@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    category: Optional[ProductCategory] = None,
    condition: Optional[ProductCondition] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Liste tous les produits avec filtres optionnels
    """
    query = db.query(Product).filter(Product.is_active == True)
    
    # Filtres
    if category:
        query = query.filter(Product.category == category)
    
    if condition:
        query = query.filter(Product.condition == condition)
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if search:
        # Sanitize et limiter la longueur de la recherche
        search = search.strip()[:100]
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.brand.ilike(f"%{search}%")) |
            (Product.description.ilike(f"%{search}%")) |
            (Product.specifications.ilike(f"%{search}%")) |
            (Product.category.ilike(f"%{search}%"))
        )
    
    # Eager loading du seller pour éviter N+1 queries
    products = query.options(joinedload(Product.seller)).offset(skip).limit(limit).all()
    
    logger.info(f"Récupération de {len(products)} produits avec filtres", extra={
        "category": category,
        "condition": condition,
        "search": search
    })
    
    return [serialize_product(p) for p in products]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Récupère un produit par son ID
    """
    product = db.query(Product).options(
        joinedload(Product.seller)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    return serialize_product(product)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_vendeur),
    db: Session = Depends(get_db)
):
    """
    Crée un nouveau produit (vendeurs seulement)
    """
    payload = product_data.model_dump()
    image_urls = payload.pop("image_urls", None)
    variants = payload.pop("variants", None)
    new_product = Product(**payload, seller_id=current_user.id)
    if isinstance(image_urls, list):
        cleaned = [u.strip() for u in image_urls if isinstance(u, str) and u.strip()]
        new_product.image_urls = json.dumps(cleaned)
        if cleaned and not new_product.image_url:
            new_product.image_url = cleaned[0]
    if isinstance(variants, list):
        new_product.variants = json.dumps(variants)
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    logger.info(f"Nouveau produit créé: {new_product.id} par vendeur {current_user.id}")
    return serialize_product(new_product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_vendeur),
    db: Session = Depends(get_db)
):
    """
    Met à jour un produit (propriétaire ou admin seulement)
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Vérifier les permissions
    check_product_ownership(product, current_user)
    
    # Mettre à jour les champs
    payload = product_data.model_dump(exclude_unset=True)
    image_urls = payload.pop("image_urls", None)
    variants = payload.pop("variants", None)
    for field, value in payload.items():
        setattr(product, field, value)
    if image_urls is not None:
        cleaned = [u.strip() for u in image_urls if isinstance(u, str) and u.strip()]
        product.image_urls = json.dumps(cleaned)
        if cleaned and not product.image_url:
            product.image_url = cleaned[0]
    if variants is not None:
        product.variants = json.dumps(variants)
    
    db.commit()
    db.refresh(product)
    
    return serialize_product(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_vendeur),
    db: Session = Depends(get_db)
):
    """
    Supprime un produit (propriétaire ou admin seulement)
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Vérifier les permissions
    check_product_ownership(product, current_user)
    
    logger.info(f"Produit {product_id} supprimé par utilisateur {current_user.id}")
    db.delete(product)
    db.commit()
    
    return None


@router.post("/ai/generate-description", response_model=AIDescriptionResponse)
async def generate_description(
    request: AIDescriptionRequest,
    current_user: User = Depends(get_current_vendeur)
):
    """
    Génère une description de produit avec l'IA (vendeurs seulement)
    """
    description = await ai_service.generate_description(request)
    
    return {
        "description": description,
        "provider": settings.AI_PROVIDER
    }


@router.get("/seller/my-products", response_model=List[ProductResponse])
def get_my_products(
    current_user: User = Depends(get_current_vendeur),
    db: Session = Depends(get_db)
):
    """
    Liste les produits du vendeur connecté
    """
    products = db.query(Product).options(
        joinedload(Product.seller)
    ).filter(Product.seller_id == current_user.id).all()
    
    logger.info(f"Vendeur {current_user.id} récupère ses {len(products)} produits")
    return [serialize_product(p) for p in products]
