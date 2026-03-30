"""
Routes analytics événementielles
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..core.database import get_db
from ..core.dependencies import get_current_user, get_current_vendeur, get_current_admin
from ..models import AnalyticsEvent, Product, User
from ..schemas import AnalyticsEventCreate, SellerAnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/events", status_code=status.HTTP_201_CREATED)
def create_event(
    payload: AnalyticsEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    seller_id = None
    if payload.product_id:
        product = db.query(Product).filter(Product.id == payload.product_id).first()
        if product:
            seller_id = product.seller_id

    event = AnalyticsEvent(
        event_type=payload.event_type,
        user_id=current_user.id,
        product_id=payload.product_id,
        seller_id=seller_id,
        order_id=payload.order_id,
        metadata_json=payload.metadata or {},
    )
    db.add(event)
    db.commit()
    return {"message": "event enregistré"}


@router.get("/seller/summary", response_model=SellerAnalyticsSummary)
def get_seller_summary(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_vendeur),
    db: Session = Depends(get_db),
):
    start = datetime.now(timezone.utc) - timedelta(days=days)
    base = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.seller_id == current_user.id,
        AnalyticsEvent.created_at >= start,
    )

    def count_for(event_type: str) -> int:
        return base.filter(AnalyticsEvent.event_type == event_type).count()

    return {
        "product_views": count_for("product_viewed"),
        "add_to_cart": count_for("add_to_cart"),
        "checkout_started": count_for("checkout_started"),
        "order_completed": count_for("order_completed"),
    }


@router.get("/admin/summary")
def get_admin_summary(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    start = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(AnalyticsEvent.event_type, func.count(AnalyticsEvent.id).label("count"))
        .filter(AnalyticsEvent.created_at >= start)
        .group_by(AnalyticsEvent.event_type)
        .all()
    )
    return {
        "period_days": days,
        "events": [{"event_type": r.event_type, "count": int(r.count)} for r in rows],
    }
