"""
Application principale FastAPI - Marketplace
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.engine import make_url
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .core.config import settings
from .core.limiter import limiter
from .core.database import Base, engine, SessionLocal
from .core.logging_config import setup_logging, get_logger
from .core.exception_handlers import register_exception_handlers
from .models import Product
from .routes import (
    auth_router,
    products_router,
    cart_router,
    orders_router,
    admin_router,
    account_router,
    analytics_router,
    wishlist_router,
    reviews_router,
    questions_router,
    support_router,
)

# Configurer le logging
setup_logging()
logger = get_logger(__name__)


def _safe_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Évite un 500 texte si l’état SlowAPI (view_rate_limit) est incomplet."""
    try:
        return _rate_limit_exceeded_handler(request, exc)
    except Exception:
        logger.exception("Handler SlowAPI RateLimitExceeded a échoué")
        return JSONResponse(
            status_code=429,
            content={"detail": "Trop de requêtes. Patientez une minute puis réessayez."},
        )


# Créer les tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie FastAPI (remplace @app.on_event)."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Vérification DB au démarrage : OK")
        try:
            u = make_url(settings.DATABASE_URL)
            logger.info(
                "Base utilisée par l'API : %s (hôte=%s, base=%s)",
                u.drivername,
                u.host or "(local)",
                u.database or "(non défini)",
            )
        except Exception:
            pass
    except Exception as e:
        logger.error(
            "Vérification DB au démarrage : échec — %s",
            e,
            exc_info=True,
        )
    logger.info("Application Marketplace démarrée", extra={
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    })
    yield
    logger.info("Application Marketplace arrêtée")


# Créer l'application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST pour marketplace de produits reconditionnés",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Ajouter le rate limiter à l'application
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _safe_rate_limit_exceeded_handler)
register_exception_handlers(app)

# Configuration CORS (restrictif en production)
cors_config = {
    "allow_origins": settings.cors_origins,
    "allow_credentials": True,
}

# En développement : permissif pour faciliter le dev
if settings.ENVIRONMENT == "development":
    cors_config["allow_methods"] = ["*"]
    cors_config["allow_headers"] = ["*"]
    # localhost / 127.0.0.1 / ::1 et tout port (Vite, preview, etc.)
    cors_config["allow_origin_regex"] = (
        r"https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?"
    )
else:
    # En production : restrictif pour la sécurité
    cors_config["allow_methods"] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_config["allow_headers"] = ["Content-Type", "Authorization"]

app.add_middleware(CORSMiddleware, **cors_config)

logger.info(f"CORS configuré pour environnement: {settings.ENVIRONMENT}")

# Inclure les routes
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(products_router, prefix=settings.API_PREFIX)
app.include_router(cart_router, prefix=settings.API_PREFIX)
app.include_router(orders_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)
app.include_router(account_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(wishlist_router, prefix=settings.API_PREFIX)
app.include_router(reviews_router, prefix=settings.API_PREFIX)
app.include_router(questions_router, prefix=settings.API_PREFIX)
app.include_router(support_router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    """Route racine"""
    logger.debug("Accès à la route racine")
    return {
        "message": "Bienvenue sur l'API Marketplace",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Endpoint de santé"""
    return {"status": "healthy"}


@app.get("/health/ready")
def health_ready():
    """Prêt à servir du trafic (inclut la base). Répond 503 si MySQL est indisponible."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready", "database": "ok"}
    except Exception as e:
        logger.warning("health/ready: base indisponible — %s", e)
        detail = (
            str(e)
            if settings.ENVIRONMENT == "development"
            else "Base de données indisponible"
        )
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": "error", "detail": detail},
        )


@app.get("/sitemap.xml")
def sitemap():
    db = SessionLocal()
    try:
        products = db.query(Product.id).filter(Product.is_active == True).all()
    finally:
        db.close()
    urls = [
        "<url><loc>http://localhost:5173/</loc></url>",
        "<url><loc>http://localhost:5173/products</loc></url>",
    ]
    urls.extend([f"<url><loc>http://localhost:5173/products/{p[0]}</loc></url>" for p in products])
    xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
    xml += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">"
    xml += "".join(urls)
    xml += "</urlset>"
    return Response(content=xml, media_type="application/xml")
