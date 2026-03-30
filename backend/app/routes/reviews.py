"""Routes des avis vérifiés."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models import Review, Order, OrderItem, User
from ..schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Avis"])


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit être entre 1 et 5")

    order = db.query(Order).filter(Order.id == payload.order_id, Order.customer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    if order.status.value != "delivered":
        raise HTTPException(status_code=400, detail="Avis autorisé uniquement après livraison")

    has_product = db.query(OrderItem).filter(
        OrderItem.order_id == payload.order_id,
        OrderItem.product_id == payload.product_id,
    ).first()
    if not has_product:
        raise HTTPException(status_code=400, detail="Ce produit ne fait pas partie de la commande")

    exists = db.query(Review).filter(
        Review.order_id == payload.order_id,
        Review.product_id == payload.product_id,
        Review.customer_id == current_user.id,
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="Avis déjà envoyé pour ce produit et cette commande")

    row = Review(
        order_id=payload.order_id,
        product_id=payload.product_id,
        customer_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
