from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

# --- Product ---
class ProductBase(BaseModel):
    product_name: str
    description: Optional[str] = None
    price: Decimal
    quantity: int
    foreign_id: int
    foreign_type_id: int
    product_type_id: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# --- Order ---
class OrderBase(BaseModel):
    purchaser_id: int
    purchaser_type_id: int
    order_total: Decimal
    status_id: int

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True
