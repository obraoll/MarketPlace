"""
Routes pour le panier
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models import CartItem, Product, User
from ..schemas import CartItemCreate, CartItemUpdate, CartItemResponse

router = APIRouter(prefix="/cart", tags=["Panier"])


@router.get("/", response_model=List[CartItemResponse])
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère le panier de l'utilisateur connecté
    """
    cart_items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return cart_items


@router.post("/", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ajoute un produit au panier
    """
    # Vérifier que le produit existe
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    # Vérifier le stock
    if product.stock < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock insuffisant"
        )
    
    # Règle mono-vendeur: le panier ne peut contenir qu'un seul vendeur.
    existing_cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if existing_cart_items:
        existing_product_ids = [ci.product_id for ci in existing_cart_items]
        seller_ids = {
            row.seller_id
            for row in db.query(Product.seller_id).filter(Product.id.in_(existing_product_ids)).all()
        }
        if seller_ids and product.seller_id not in seller_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Votre panier contient déjà des produits d'un autre vendeur"
            )

    # Vérifier si l'item existe déjà dans le panier
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item.product_id
    ).first()
    
    if existing_item:
        # Mettre à jour la quantité
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    
    # Créer un nouvel item
    new_item = CartItem(
        user_id=current_user.id,
        product_id=item.product_id,
        quantity=item.quantity
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item


@router.put("/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Met à jour la quantité d'un item du panier
    """
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item non trouvé dans le panier"
        )
    
    # Vérifier le stock
    product = cart_item.product
    if product.stock < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock insuffisant"
        )
    
    cart_item.quantity = item_data.quantity
    db.commit()
    db.refresh(cart_item)
    
    return cart_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime un item du panier
    """
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item non trouvé dans le panier"
        )
    
    db.delete(cart_item)
    db.commit()
    
    return None


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Vide le panier de l'utilisateur
    """
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    
    return None
