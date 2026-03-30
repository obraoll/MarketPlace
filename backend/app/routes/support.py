"""Routes support: messages et retours."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models import SupportMessage, ReturnRequest, Order, User, SupportTicket
from ..schemas import (
    SupportMessageCreate,
    SupportMessageResponse,
    ReturnRequestCreate,
    ReturnRequestResponse,
    SupportTicketCreate,
    SupportTicketUpdate,
    SupportTicketResponse,
)

router = APIRouter(prefix="/support", tags=["Support"])


@router.get("/messages", response_model=List[SupportMessageResponse])
def get_my_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SupportMessage).filter(
        (SupportMessage.sender_id == current_user.id) | (SupportMessage.recipient_id == current_user.id)
    ).order_by(SupportMessage.created_at.desc()).all()


@router.post("/messages", response_model=SupportMessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(payload: SupportMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    if current_user.id not in {order.customer_id, order.seller_id}:
        raise HTTPException(status_code=403, detail="Accès refusé")
    recipient_id = order.seller_id if current_user.id == order.customer_id else order.customer_id
    row = SupportMessage(
        order_id=payload.order_id,
        sender_id=current_user.id,
        recipient_id=recipient_id,
        subject=payload.subject.strip()[:150],
        message=payload.message.strip(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/returns", response_model=List[ReturnRequestResponse])
def get_my_returns(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ReturnRequest).filter(ReturnRequest.customer_id == current_user.id).order_by(ReturnRequest.created_at.desc()).all()


@router.post("/returns", response_model=ReturnRequestResponse, status_code=status.HTTP_201_CREATED)
def create_return(payload: ReturnRequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payload.order_id, Order.customer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    if order.status.value not in {"delivered", "shipped"}:
        raise HTTPException(status_code=400, detail="Retour possible uniquement après expédition/livraison")
    row = ReturnRequest(order_id=payload.order_id, customer_id=current_user.id, reason=payload.reason.strip())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/tickets", response_model=List[SupportTicketResponse])
def get_my_tickets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).order_by(SupportTicket.created_at.desc()).all()


@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: SupportTicketCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = SupportTicket(
        user_id=current_user.id,
        channel=(payload.channel or "web").strip().lower(),
        category=(payload.category or "general").strip().lower(),
        priority=(payload.priority or "normal").strip().lower(),
        status="open",
        subject=payload.subject.strip()[:150],
        message=payload.message.strip(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/tickets/{ticket_id}", response_model=SupportTicketResponse)
def update_ticket_admin(
    ticket_id: int,
    payload: SupportTicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Accès admin requis")
    row = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    row.status = payload.status.strip().lower()
    row.priority = payload.priority.strip().lower()
    db.commit()
    db.refresh(row)
    return row


@router.get("/admin/tickets", response_model=List[SupportTicketResponse])
def get_all_tickets_admin(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Accès admin requis")
    return db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()
