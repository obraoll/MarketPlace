"""
Configuration de l'application
"""
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List
from pathlib import Path

# Dossier backend (parent du dossier app)
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Configuration générale de l'application"""
    
    # Application
    APP_NAME: str = "Marketplace Reconditionné"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/marketplace_db"
    
    # JWT - clé fixe en dev si .env absent
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # Environment
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # AI Configuration
    AI_PROVIDER: str = "openai"  # openai, anthropic, google
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    
    model_config = ConfigDict(
        env_file=str(_BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
    )
    
    @property
    def cors_origins(self) -> List[str]:
        """Convertit la chaîne CORS en liste"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
