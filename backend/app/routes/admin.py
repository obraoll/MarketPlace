"""
Routes d'administration.
L'admin gère uniquement les vendeurs et la vue d'ensemble du site.
Pas de gestion des clients, des produits ni des commandes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.dependencies import get_current_admin
from ..models import User, Product, Order, UserRole, PromoCode, ReturnRequest, SupportMessage
from ..schemas import UserResponse, PromoCodeCreate, PromoCodeResponse

router = APIRouter(prefix="/admin", tags=["Administration"])


def _ensure_vendeur(user: User) -> None:
    """Vérifie que l'utilisateur cible est un vendeur (admin ne gère que les vendeurs)."""
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Impossible de modifier un administrateur"
        )
    if user.role != UserRole.VENDEUR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="L'admin ne gère que les vendeurs, pas les clients"
        )


@router.get("/vendors", response_model=List[UserResponse])
def get_vendors(
    current_user: User = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Liste tous les vendeurs (admin seulement).
    L'admin ne gère pas les clients.
    """
    vendors = (
        db.query(User)
        .filter(User.role == UserRole.VENDEUR)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return vendors


@router.put("/vendors/{user_id}/activate")
def activate_vendor(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Active un vendeur (admin seulement)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendeur non trouvé")
    _ensure_vendeur(user)
    user.is_active = True
    user.is_blocked = False
    db.commit()
    return {"message": "Vendeur activé avec succès"}


@router.put("/vendors/{user_id}/deactivate")
def deactivate_vendor(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Désactive un vendeur (admin seulement)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendeur non trouvé")
    _ensure_vendeur(user)
    user.is_active = False
    db.commit()
    return {"message": "Vendeur désactivé avec succès"}


@router.put("/vendors/{user_id}/block")
def block_vendor(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Bloque un vendeur (admin seulement)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendeur non trouvé")
    _ensure_vendeur(user)
    user.is_active = False
    user.is_blocked = True
    db.commit()
    return {"message": "Vendeur bloqué avec succès"}


@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Vue d'ensemble du site (statistiques globales, lecture seule).
    L'admin ne gère pas les clients, produits ni commandes.
    """
    total_users = db.query(User).count()
    total_clients = db.query(User).filter(User.role == UserRole.CLIENT).count()
    total_vendeurs = db.query(User).filter(User.role == UserRole.VENDEUR).count()
    total_products = db.query(Product).count()
    active_products = db.query(Product).filter(Product.is_active == True).count()
    total_orders = db.query(Order).count()
    
    from sqlalchemy import func
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    
    return {
        "users": {
            "total": total_users,
            "clients": total_clients,
            "vendeurs": total_vendeurs
        },
        "products": {
            "total": total_products,
            "active": active_products
        },
        "orders": {
            "total": total_orders,
            "revenue": float(total_revenue)
        }
    }


@router.get("/promos", response_model=List[PromoCodeResponse])
def list_promos(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()


@router.post("/promos", response_model=PromoCodeResponse, status_code=status.HTTP_201_CREATED)
def create_promo(
    payload: PromoCodeCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    code = payload.code.strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Code promo invalide")
    existing = db.query(PromoCode).filter(PromoCode.code == code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Code promo déjà existant")
    row = PromoCode(
        code=code,
        discount_percent=max(0.0, min(80.0, payload.discount_percent)),
        max_uses=max(0, payload.max_uses),
        is_active=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/promos/{promo_id}/toggle")
def toggle_promo(
    promo_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Code promo non trouvé")
    row.is_active = not row.is_active
    db.commit()
    return {"message": "Code promo mis à jour", "is_active": row.is_active}


@router.get("/litiges/returns")
def get_return_requests(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    returns = db.query(ReturnRequest).order_by(ReturnRequest.created_at.desc()).all()
    return returns


@router.put("/litiges/returns/{return_id}/status")
def update_return_status(
    return_id: int,
    new_status: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.query(ReturnRequest).filter(ReturnRequest.id == return_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Demande de retour non trouvée")
    status_value = new_status.strip().lower()
    if status_value not in {"pending", "approved", "rejected", "refunded"}:
        raise HTTPException(status_code=400, detail="Statut de retour invalide")
    row.status = status_value
    db.commit()
    return {"message": "Statut du retour mis à jour", "status": row.status}


@router.get("/litiges/messages")
def get_support_messages(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    messages = db.query(SupportMessage).order_by(SupportMessage.created_at.desc()).all()
    return messages
