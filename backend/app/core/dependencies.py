"""
Dépendances FastAPI pour l'authentification et l'autorisation
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from .database import get_db
from .security import decode_access_token
from ..models import User, UserRole

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Récupère l'utilisateur actuel à partir du token JWT
    
    Args:
        credentials: Token JWT
        db: Session de base de données
    
    Returns:
        Utilisateur actuel
    
    Raises:
        HTTPException: Si le token est invalide ou l'utilisateur n'existe pas
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authentification requise"
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré"
        )
    
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    # Convertir en int pour la requête
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé"
        )
    
    if not user.is_active or user.is_blocked:
        status_msg = "Compte bloqué" if user.is_blocked else "Compte désactivé"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=status_msg
        )
    
    return user


async def get_current_vendeur(
    current_user: User = Depends(get_current_user)
) -> User:
    """Vérifie que l'utilisateur actuel est un vendeur"""
    if current_user.role not in [UserRole.VENDEUR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux vendeurs"
        )
    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Vérifie que l'utilisateur actuel est un administrateur"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user
