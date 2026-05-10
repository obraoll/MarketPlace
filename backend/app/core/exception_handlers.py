"""
Gestion centralisée des erreurs : logs complets, réponses JSON cohérentes,
messages exploitables en dev sans exposer la stack en production.
"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from .config import settings
from .logging_config import get_logger

logger = get_logger(__name__)


def _operational_error_is_schema_mismatch(exc: OperationalError) -> bool:
    """True si l’erreur ressemble à un schéma SQL obsolète (colonne/table manquante), pas à une panne réseau."""
    text = str(exc).lower()
    markers = (
        "1054",  # unknown column
        "1146",  # table doesn't exist
        "1364",  # field doesn't have a default
        "unknown column",
        "doesn't exist",
        "n'existe pas",
        "champ",
        "inconnu",
    )
    return any(m in text for m in markers)


def register_exception_handlers(app: FastAPI) -> None:
    """À appeler une seule fois après création de l'app FastAPI."""

    @app.exception_handler(OperationalError)
    async def db_operational_handler(request: Request, exc: OperationalError) -> JSONResponse:
        if _operational_error_is_schema_mismatch(exc):
            logger.exception("OperationalError (schéma BDD / requête incompatible)")
            detail = (
                f"Schéma de base incompatible avec l’application : {exc}"
                if settings.ENVIRONMENT == "development"
                else (
                    "La structure de la base ne correspond pas au code. "
                    "Appliquez les scripts SQL dans backend/migrations/ puis redémarrez le serveur."
                )
            )
            return JSONResponse(status_code=500, content={"detail": detail})

        logger.exception(
            "OperationalError (MySQL arrêté, mauvais credentials ou DATABASE_URL)"
        )
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "Base de données inaccessible. Démarrez MySQL et vérifiez DATABASE_URL "
                    "dans backend/.env."
                )
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def db_generic_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.exception("SQLAlchemyError")
        return JSONResponse(
            status_code=500,
            content={
                "detail": (
                    str(exc)
                    if settings.ENVIRONMENT == "development"
                    else "Erreur lors de l’accès aux données."
                )
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(request: Request, exc: Exception) -> JSONResponse:
        # HTTPException / validation : handlers FastAPI plus spécifiques (MRO) passent avant.
        logger.exception("Erreur non gérée")
        if settings.ENVIRONMENT == "development":
            detail = f"{type(exc).__name__}: {exc}"
        else:
            detail = "Une erreur interne s’est produite. Consultez les logs serveur."
        return JSONResponse(status_code=500, content={"detail": detail})
