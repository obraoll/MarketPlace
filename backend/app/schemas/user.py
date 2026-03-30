"""
Schémas Pydantic pour les utilisateurs
"""
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from ..models.user import UserRole


class UserBase(BaseModel):
    """Schéma de base utilisateur"""
    email: EmailStr
    first_name: str
    last_name: str


class UserCreate(UserBase):
    """Schéma pour créer un utilisateur"""
    password: str
    role: Optional[UserRole] = UserRole.CLIENT


class UserLogin(BaseModel):
    """Schéma pour se connecter"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schéma pour mettre à jour un utilisateur"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    """Schéma de réponse utilisateur"""
    id: int
    role: UserRole
    is_active: bool
    is_blocked: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schéma pour le token JWT"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schéma pour les données du token"""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
