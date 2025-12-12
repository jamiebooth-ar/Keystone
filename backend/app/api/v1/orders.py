from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import order as order_schema
from app.models import order as order_model

router = APIRouter()

@router.get("/", response_model=List[order_schema.Order])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve orders.
    """
    orders = db.query(order_model.Order).offset(skip).limit(limit).all()
    return orders

@router.post("/", response_model=order_schema.Order)
def create_order(
    *,
    db: Session = Depends(get_db),
    order_in: order_schema.OrderCreate
) -> Any:
    """
    Create new order.
    """
    order = order_model.Order(**order_in.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
