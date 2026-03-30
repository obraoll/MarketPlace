"""Routes questions/réponses produits."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.dependencies import get_current_user, get_current_vendeur
from ..models import ProductQuestion, Product, User
from ..schemas import ProductQuestionCreate, ProductAnswerCreate, ProductQuestionResponse

router = APIRouter(prefix="/questions", tags=["Q&A"])


@router.get("/product/{product_id}", response_model=List[ProductQuestionResponse])
def get_product_questions(product_id: int, db: Session = Depends(get_db)):
    return db.query(ProductQuestion).filter(ProductQuestion.product_id == product_id).order_by(ProductQuestion.created_at.desc()).all()


@router.post("/", response_model=ProductQuestionResponse, status_code=status.HTTP_201_CREATED)
def ask_question(payload: ProductQuestionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    row = ProductQuestion(product_id=payload.product_id, user_id=current_user.id, question=payload.question.strip())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/{question_id}/answer", response_model=ProductQuestionResponse)
def answer_question(
    question_id: int,
    payload: ProductAnswerCreate,
    current_user: User = Depends(get_current_vendeur),
    db: Session = Depends(get_db),
):
    row = db.query(ProductQuestion).filter(ProductQuestion.id == question_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Question non trouvée")
    product = db.query(Product).filter(Product.id == row.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    if current_user.role.value == "vendeur" and product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez répondre qu'aux questions de vos produits")
    row.answer = payload.answer.strip()
    row.answered_by = current_user.id
    row.status = "answered"
    db.commit()
    db.refresh(row)
    return row
