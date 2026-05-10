"""
Réassigne les commandes passées avec un compte non-client vers un compte client cible
et répare les commandes ayant seller_id NULL.

Usage:
  cd backend
  venv/Scripts/python.exe reassign_orders_to_client.py client@marketplace.com
"""
from __future__ import annotations

import sys

from app.core.database import SessionLocal
from app.models import Order, OrderItem, Product, User
from app.models.user import UserRole


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python reassign_orders_to_client.py <email_client>")

    target_email = sys.argv[1].strip().lower()
    db = SessionLocal()
    try:
        target = db.query(User).filter(User.email == target_email).first()
        if not target:
            raise SystemExit(f"Client introuvable: {target_email}")
        if target.role != UserRole.CLIENT:
            raise SystemExit(f"Le compte cible n'est pas client: {target.email} ({target.role})")

        reassigned = 0
        wrong_customer_orders = (
            db.query(Order)
            .join(User, User.id == Order.customer_id)
            .filter(User.role.in_([UserRole.VENDEUR, UserRole.ADMIN]))
            .all()
        )
        for order in wrong_customer_orders:
            order.customer_id = target.id
            reassigned += 1

        repaired_seller = 0
        null_seller_orders = db.query(Order).filter(Order.seller_id.is_(None)).all()
        for order in null_seller_orders:
            first_item = (
                db.query(OrderItem)
                .filter(OrderItem.order_id == order.id)
                .order_by(OrderItem.id.asc())
                .first()
            )
            if not first_item:
                continue
            product = db.query(Product).filter(Product.id == first_item.product_id).first()
            if product and product.seller_id:
                order.seller_id = product.seller_id
                repaired_seller += 1

        db.commit()

        total_for_target = db.query(Order).filter(Order.customer_id == target.id).count()
        print(f"Client cible: {target.email} (id={target.id})")
        print(f"Commandes réassignées: {reassigned}")
        print(f"Commandes réparées (seller_id NULL): {repaired_seller}")
        print(f"Total commandes du client cible: {total_for_target}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
