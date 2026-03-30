"""
Routes pour la gestion du compte utilisateur
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..core.security import verify_password, get_password_hash
from ..models import User
from ..schemas.user import UserResponse, UserUpdate
from pydantic import BaseModel

router = APIRouter(prefix="/account", tags=["Compte"])


class PasswordChange(BaseModel):
    """Schéma pour changer le mot de passe"""
    current_password: str
    new_password: str


@router.get("/me", response_model=UserResponse)
def get_account(current_user: User = Depends(get_current_user)):
    """
    Récupère les informations du compte
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_account(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Met à jour les informations du compte
    """
    # Vérifier si le nouvel email est déjà utilisé
    if user_data.email and user_data.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
    
    # Mettre à jour les champs
    for field, value in user_data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.put("/password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change le mot de passe du compte
    """
    # Vérifier le mot de passe actuel
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect"
        )
    
    # Vérifier que le nouveau mot de passe est différent
    if password_data.current_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit être différent de l'ancien"
        )
    
    # Mettre à jour le mot de passe
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Mot de passe modifié avec succès"}


@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime le compte utilisateur (soft delete)
    """
    # Désactiver le compte au lieu de le supprimer
    current_user.is_active = False
    db.commit()
    
    return {"message": "Compte désactivé avec succès"}
