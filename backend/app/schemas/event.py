from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class EventBase(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    city: Optional[str] = None
    address: Optional[str] = None
    type_id: int
    status_id: int = 1
    standard_price: Optional[Decimal] = None

class EventCreate(EventBase):
    pass

class EventUpdate(EventBase):
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None

class EventInDBBase(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Event(EventInDBBase):
    pass
