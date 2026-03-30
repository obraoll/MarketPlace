"""
Configuration de la base de données
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# Création de l'engine SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# Session locale
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()


def get_db():
    """
    Générateur de session de base de données
    Utilisé comme dépendance dans les routes FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
