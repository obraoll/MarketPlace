"""
Routes d'authentification
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.config import settings
from ..core.dependencies import get_current_user
from ..models import User
from ..schemas import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentification"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Inscription d'un nouvel utilisateur
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Créer le nouvel utilisateur
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")  # Maximum 5 tentatives par minute
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Connexion d'un utilisateur
    Protection : 5 tentatives maximum par minute par IP
    """
    # Trouver l'utilisateur
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    if not user.is_active or user.is_blocked:
        status_msg = "Compte bloqué" if user.is_blocked else "Compte désactivé"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=status_msg
        )
    
    # Créer le token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value},  # ✅ Convertir en string
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Récupère les informations de l'utilisateur connecté
    """
    return current_user
