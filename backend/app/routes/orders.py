"""
Routes pour les commandes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import secrets
from ..core.database import get_db
from ..core.dependencies import get_current_user, get_current_vendeur
from ..models import Order, OrderItem, Product, User, CartItem, OrderStatus, OrderCheckoutMeta, PromoCode
from ..models.user import UserRole
from ..schemas import OrderCreate, OrderFromCartCreate, OrderUpdate, OrderResponse
from ..schemas.user import UserResponse

router = APIRouter(prefix="/orders", tags=["Commandes"])

ALLOWED_STATUS_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.CONFIRMED, OrderStatus.CANCELLED},
    OrderStatus.CONFIRMED: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}

SHIPPING_METHODS = {
    "standard": {
        "label": "Standard",
        "eta_days": (3, 5),
    },
    "relay": {
        "label": "Point relais",
        "eta_days": (2, 4),
    },
    "express": {
        "label": "Express",
        "eta_days": (1, 2),
    },
}


def validate_single_seller(product_seller_id: int, seller_id_ref: int | None) -> int:
    """Valide qu'une commande ne contient que des produits d'un seul vendeur.

    Cette contrainte simplifie le fulfillment actuel :
    1 commande = 1 vendeur (expédition, suivi, statuts).
    """
    if seller_id_ref is None:
        return product_seller_id
    if seller_id_ref != product_seller_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Une commande ne peut contenir que des produits d'un seul vendeur"
        )
    return seller_id_ref


def generate_order_number() -> str:
    """Génère un numéro de commande unique"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_part = secrets.token_hex(4).upper()
    return f"ORD-{timestamp}-{random_part}"


def normalize_shipping_method(raw_method: str | None) -> str:
    method = (raw_method or "standard").strip().lower()
    if method not in SHIPPING_METHODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mode de livraison invalide (standard, relay, express)"
        )
    return method


def compute_shipping_cost(method: str, total_amount: float) -> float:
    method = normalize_shipping_method(method)
    if method == "express":
        return 9.90
    if method == "relay":
        return 4.90
    # standard
    return 0.0 if total_amount >= 80 else 6.90


def estimate_delivery_window(created_at: datetime, method: str) -> tuple[str, str]:
    method = normalize_shipping_method(method)
    min_days, max_days = SHIPPING_METHODS[method]["eta_days"]
    base_date = created_at.date()
    start = (base_date + timedelta(days=min_days)).isoformat()
    end = (base_date + timedelta(days=max_days)).isoformat()
    return start, end


def add_shipping_details(order: Order) -> Order:
    if not order.checkout_meta:
        return order
    shipping_method = normalize_shipping_method(order.checkout_meta.shipping_method)
    start, end = estimate_delivery_window(order.created_at, shipping_method)
    order.checkout_meta.shipping_method = shipping_method
    order.checkout_meta.shipping_label = SHIPPING_METHODS[shipping_method]["label"]
    order.checkout_meta.estimated_delivery_start = start
    order.checkout_meta.estimated_delivery_end = end
    order.checkout_meta.tracking_number = f"TRK-{order.order_number}"
    return order


def compute_discount(db: Session, promo_code_value: str | None, subtotal: float) -> tuple[float, str | None]:
    if not promo_code_value:
        return 0.0, None
    code_value = promo_code_value.strip().upper()
    if not code_value:
        return 0.0, None
    promo = db.query(PromoCode).filter(PromoCode.code == code_value, PromoCode.is_active == True).first()
    if not promo:
        return 0.0, None
    if promo.max_uses > 0 and promo.used_count >= promo.max_uses:
        return 0.0, None
    pct = max(0.0, min(80.0, float(promo.discount_percent or 0.0)))
    discount = round(subtotal * (pct / 100.0), 2)
    promo.used_count += 1
    return discount, code_value


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crée une nouvelle commande à partir des items fournis
    """
    # Garde-fou métier: seules les sessions client peuvent créer des commandes.
    # Sinon les commandes seraient rattachées au mauvais "customer_id".
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les comptes client peuvent passer commande"
        )

    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La commande doit contenir au moins un produit"
        )
    
    # Calculer le montant total et vérifier les stocks
    total_amount = 0.0
    order_items = []
    seller_id_ref = None
    
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produit {item.product_id} non trouvé"
            )
        
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuffisant pour {product.name}"
            )
        
        # Applique explicitement la règle mono-vendeur sur chaque item.
        seller_id_ref = validate_single_seller(product.seller_id, seller_id_ref)
        total_amount += product.price * item.quantity
        order_items.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "unit_price": product.price
        })
    
    subtotal = total_amount
    discount_amount, promo_code_used = compute_discount(db, order_data.promo_code, subtotal)
    shipping_method = normalize_shipping_method(order_data.shipping_method)
    shipping_cost = compute_shipping_cost(shipping_method, subtotal - discount_amount)
    platform_fee = round((subtotal - discount_amount) * 0.08, 2)
    shipping_address = (order_data.shipping_address or "").strip() or "Adresse non fournie"
    billing_address = (order_data.billing_address or "").strip() or shipping_address

    # Créer la commande
    new_order = Order(
        order_number=generate_order_number(),
        customer_id=current_user.id,
        seller_id=seller_id_ref,
        subtotal_amount=subtotal,
        discount_amount=discount_amount,
        shipping_amount=shipping_cost,
        platform_fee_amount=platform_fee,
        promo_code=promo_code_used,
        total_amount=subtotal - discount_amount + shipping_cost,
        status=OrderStatus.PENDING
    )
    
    db.add(new_order)
    db.flush()
    
    # Créer les items de commande et mettre à jour les stocks
    for item_data in order_items:
        order_item = OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(order_item)
        
        # Décrémenter le stock
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock -= item_data["quantity"]

    db.add(OrderCheckoutMeta(
        order_id=new_order.id,
        shipping_address=shipping_address,
        billing_address=billing_address,
        shipping_method=shipping_method,
        shipping_cost=shipping_cost,
        payment_method=order_data.payment_method or "card",
        payment_status="paid_mock",
    ))
    
    db.commit()
    db.refresh(new_order)
    
    return add_shipping_details(new_order)


@router.post("/from-cart", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order_from_cart(
    checkout_data: OrderFromCartCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crée une commande à partir du panier de l'utilisateur
    """
    # Même garde-fou pour le checkout panier.
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les comptes client peuvent passer commande"
        )

    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Votre panier est vide"
        )
    
    # Calculer le montant total et vérifier les stocks
    total_amount = 0.0
    order_items = []
    seller_id_ref = None
    
    for cart_item in cart_items:
        product = cart_item.product
        
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuffisant pour {product.name}"
            )
        
        # Le panier peut contenir plusieurs lignes, mais toujours d'un seul vendeur.
        seller_id_ref = validate_single_seller(product.seller_id, seller_id_ref)
        total_amount += product.price * cart_item.quantity
        order_items.append({
            "product_id": product.id,
            "quantity": cart_item.quantity,
            "unit_price": product.price
        })
    
    subtotal = total_amount
    discount_amount, promo_code_used = compute_discount(db, checkout_data.promo_code, subtotal)
    shipping_method = normalize_shipping_method(checkout_data.shipping_method)
    shipping_cost = compute_shipping_cost(shipping_method, subtotal - discount_amount)
    platform_fee = round((subtotal - discount_amount) * 0.08, 2)
    shipping_address = checkout_data.shipping_address.strip()
    if not shipping_address:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Adresse de livraison requise")
    billing_address = (checkout_data.billing_address or "").strip() or shipping_address

    # Créer la commande
    new_order = Order(
        order_number=generate_order_number(),
        customer_id=current_user.id,
        seller_id=seller_id_ref,
        subtotal_amount=subtotal,
        discount_amount=discount_amount,
        shipping_amount=shipping_cost,
        platform_fee_amount=platform_fee,
        promo_code=promo_code_used,
        total_amount=subtotal - discount_amount + shipping_cost,
        status=OrderStatus.PENDING
    )
    
    db.add(new_order)
    db.flush()
    
    # Créer les items de commande et mettre à jour les stocks
    for item_data in order_items:
        order_item = OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(order_item)
        
        # Décrémenter le stock
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock -= item_data["quantity"]

    db.add(OrderCheckoutMeta(
        order_id=new_order.id,
        shipping_address=shipping_address,
        billing_address=billing_address,
        shipping_method=shipping_method,
        shipping_cost=shipping_cost,
        payment_method=checkout_data.payment_method or "card",
        payment_status="paid_mock",
    ))
    
    # Vider le panier
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    db.refresh(new_order)
    
    return add_shipping_details(new_order)


@router.get("/promo/validate")
def validate_promo(
    code: str,
    subtotal: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    discount, normalized = compute_discount(db, code, subtotal)
    # roll back promo increment for preview endpoint
    if normalized:
        promo = db.query(PromoCode).filter(PromoCode.code == normalized).first()
        if promo:
            promo.used_count = max(0, promo.used_count - 1)
        db.commit()
    return {
        "valid": bool(normalized and discount > 0),
        "code": normalized,
        "discount_amount": round(discount, 2),
    }


@router.get("/", response_model=List[OrderResponse])
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère les commandes de l'utilisateur connecté
    """
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.checkout_meta))
        .filter(Order.customer_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [add_shipping_details(order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère une commande par son ID
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.checkout_meta))
        .filter(Order.id == order_id)
        .first()
    )
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    # Vérifier que l'utilisateur est le propriétaire ou un admin
    from ..models import UserRole
    if order.customer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé à cette commande"
        )
    
    return add_shipping_details(order)


@router.put("/{order_id}", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    order_data: OrderUpdate,
    current_user: User = Depends(get_current_vendeur),
    db: Session = Depends(get_db)
):
    """
    Met à jour le statut d'une commande (vendeurs et admins seulement)
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.checkout_meta))
        .filter(Order.id == order_id)
        .first()
    )
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    if current_user.role == UserRole.VENDEUR and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que vos propres commandes"
        )

    if order_data.status:
        current_status = order.status
        new_status = order_data.status
        if new_status != current_status and new_status not in ALLOWED_STATUS_TRANSITIONS[current_status]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transition de statut non autorisée: {current_status.value} -> {new_status.value}"
            )

        # Restitution de stock uniquement sur annulation autorisée.
        if new_status == OrderStatus.CANCELLED and current_status in {OrderStatus.PENDING, OrderStatus.CONFIRMED}:
            for item in order.items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    product.stock += item.quantity

        order.status = new_status
    
    db.commit()
    db.refresh(order)
    
    return add_shipping_details(order)


@router.get("/seller/stats")
def get_seller_stats(
    current_user: User = Depends(get_current_vendeur),
    db: Session = Depends(get_db)
):
    """
    Statistiques du tableau de bord vendeur : produits, commandes, clients, CA.
    """
    total_products = db.query(Product).filter(Product.seller_id == current_user.id).count()
    total_orders = (
        db.query(Order)
        .join(OrderItem).join(Product)
        .filter(Product.seller_id == current_user.id)
        .distinct()
        .count()
    )
    total_clients = (
        db.query(User)
        .join(Order, Order.customer_id == User.id)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .join(Product, Product.id == OrderItem.product_id)
        .filter(Product.seller_id == current_user.id)
        .filter(User.role == UserRole.CLIENT)
        .distinct()
        .count()
    )
    # CA = somme (quantity * unit_price) pour les order_items dont le produit est du vendeur
    revenue_row = (
        db.query(func.sum(OrderItem.quantity * OrderItem.unit_price))
        .join(Product, Product.id == OrderItem.product_id)
        .filter(Product.seller_id == current_user.id)
        .scalar()
    )
    revenue = float(revenue_row or 0)
    return {
        "products": total_products,
        "orders": total_orders,
        "clients": total_clients,
        "revenue": revenue,
    }


@router.get("/seller/orders", response_model=List[OrderResponse])
def get_seller_orders(
    current_user: User = Depends(get_current_vendeur),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Récupère les commandes contenant des produits du vendeur
    """
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.checkout_meta))
        .filter(Order.seller_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [add_shipping_details(order) for order in orders]


@router.get("/seller/clients", response_model=List[UserResponse])
def get_seller_clients(
    current_user: User = Depends(get_current_vendeur),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Liste des clients du vendeur (ayant commandé au moins un produit chez ce vendeur).
    Le vendeur ne gère que ses clients, rien d'autre.
    """
    clients = (
        db.query(User)
        .join(Order, Order.customer_id == User.id)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .join(Product, Product.id == OrderItem.product_id)
        .filter(Product.seller_id == current_user.id)
        .filter(User.role == UserRole.CLIENT)
        .distinct()
        .offset(skip)
        .limit(limit)
        .all()
    )
    return clients
