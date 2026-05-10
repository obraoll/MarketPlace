"""
Import de tous les schémas
"""
from .user import (
    UserCreate,
    UserLogin,
    UserUpdate,
    UserResponse,
    Token,
    TokenData
)
from .product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    SellerSnippet,
    AIDescriptionRequest,
    AIDescriptionResponse
)
from .order import (
    OrderCreate,
    OrderFromCartCreate,
    OrderUpdate,
    OrderResponse,
    OrderItemResponse,
    OrderCheckoutMetaResponse,
)
from .cart import (
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse
)
from .analytics import (
    AnalyticsEventCreate,
    SellerAnalyticsSummary,
)
from .wishlist import WishlistItemCreate
from .review import ReviewCreate, ReviewResponse
from .product_question import ProductQuestionCreate, ProductAnswerCreate, ProductQuestionResponse
from .support import (
    SupportMessageCreate,
    SupportMessageResponse,
    ReturnRequestCreate,
    ReturnRequestResponse,
)
from .promo import PromoCodeCreate, PromoCodeResponse
from .ticket import SupportTicketCreate, SupportTicketUpdate, SupportTicketResponse

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserUpdate",
    "UserResponse",
    "Token",
    "TokenData",
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "SellerSnippet",
    "AIDescriptionRequest",
    "AIDescriptionResponse",
    "OrderCreate",
    "OrderFromCartCreate",
    "OrderUpdate",
    "OrderResponse",
    "OrderItemResponse",
    "OrderCheckoutMetaResponse",
    "CartItemCreate",
    "CartItemUpdate",
    "CartItemResponse",
    "AnalyticsEventCreate",
    "SellerAnalyticsSummary",
    "WishlistItemCreate",
    "ReviewCreate",
    "ReviewResponse",
    "ProductQuestionCreate",
    "ProductAnswerCreate",
    "ProductQuestionResponse",
    "SupportMessageCreate",
    "SupportMessageResponse",
    "ReturnRequestCreate",
    "ReturnRequestResponse",
    "PromoCodeCreate",
    "PromoCodeResponse",
    "SupportTicketCreate",
    "SupportTicketUpdate",
    "SupportTicketResponse",
]
