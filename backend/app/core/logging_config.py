"""
Configuration du logging structuré
"""
import logging
import sys
from pythonjsonlogger import jsonlogger


def setup_logging(level: str = "INFO"):
    """
    Configure le logging structuré en JSON pour une meilleure observabilité
    
    Args:
        level: Niveau de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Créer le logger root
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, level.upper()))
    
    # Supprimer les handlers existants
    logger.handlers.clear()
    
    # Handler pour stdout
    handler = logging.StreamHandler(sys.stdout)
    
    # Format JSON pour les logs
    formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(levelname)s %(name)s %(message)s',
        rename_fields={'levelname': 'level', 'asctime': 'timestamp'}
    )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Récupère un logger nommé
    
    Args:
        name: Nom du logger (généralement __name__)
    
    Returns:
        Logger configuré
    """
    return logging.getLogger(name)
