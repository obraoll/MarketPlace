"""Routes wishlist liée au compte."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models import User, Product, WishlistItem
from ..schemas import WishlistItemCreate

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("/", response_model=List[int])
def get_wishlist_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(WishlistItem.product_id).filter(WishlistItem.user_id == current_user.id).all()
    return [row[0] for row in rows]


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_wishlist_item(
    payload: WishlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == payload.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit non trouvé")

    exists = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == payload.product_id,
    ).first()
    if exists:
        return {"ok": True, "already_exists": True}

    row = WishlistItem(user_id=current_user.id, product_id=payload.product_id)
    db.add(row)
    db.commit()
    return {"ok": True}


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_wishlist_item(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id,
    ).first()
    if row:
        db.delete(row)
        db.commit()
    return None
