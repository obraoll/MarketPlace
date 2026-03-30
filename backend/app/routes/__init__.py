"""
Import de toutes les routes
"""
from .auth import router as auth_router
from .products import router as products_router
from .cart import router as cart_router
from .orders import router as orders_router
from .admin import router as admin_router
from .account import router as account_router
from .analytics import router as analytics_router
from .wishlist import router as wishlist_router
from .reviews import router as reviews_router
from .questions import router as questions_router
from .support import router as support_router

__all__ = [
    "auth_router",
    "products_router",
    "cart_router",
    "orders_router",
    "admin_router",
    "account_router",
    "analytics_router",
    "wishlist_router",
    "reviews_router",
    "questions_router",
    "support_router",
]
