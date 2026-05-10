"""
Gestion de la sécurité : JWT, hashage des mots de passe
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from .config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe correspond au hash (bcrypt, compatible hashes existants)."""
    if not plain_password or not hashed_password:
        return False
    try:
        pw = plain_password.encode("utf-8")[:72]
        hp = (
            hashed_password.encode("utf-8")
            if isinstance(hashed_password, str)
            else hashed_password
        )
        return bcrypt.checkpw(pw, hp)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash un mot de passe (bcrypt). Limite 72 octets."""
    pwd_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crée un token JWT
    
    Args:
        data: Données à encoder dans le token
        expires_delta: Durée de validité du token
    
    Returns:
        Token JWT encodé
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Décode un token JWT
    
    Args:
        token: Token JWT à décoder
    
    Returns:
        Payload du token ou None si invalide
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
