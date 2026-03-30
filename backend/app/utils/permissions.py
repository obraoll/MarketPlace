"""
Utilitaires pour la gestion des permissions
"""
from fastapi import HTTPException, status
from ..models import Product, User, UserRole


def check_product_ownership(product: Product, current_user: User) -> None:
    """
    Vérifie que l'utilisateur peut modifier/supprimer le produit
    
    Args:
        product: Produit à vérifier
        current_user: Utilisateur actuel
    
    Raises:
        HTTPException: Si l'utilisateur n'a pas les droits
    """
    if product.seller_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les droits pour modifier ce produit"
        )


def require_admin(user: User) -> None:
    """
    Vérifie que l'utilisateur est administrateur
    
    Args:
        user: Utilisateur à vérifier
    
    Raises:
        HTTPException: Si l'utilisateur n'est pas admin
    """
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )


def require_vendeur_or_admin(user: User) -> None:
    """
    Vérifie que l'utilisateur est vendeur ou administrateur
    
    Args:
        user: Utilisateur à vérifier
    
    Raises:
        HTTPException: Si l'utilisateur n'a pas les droits
    """
    if user.role not in [UserRole.VENDEUR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux vendeurs"
        )
