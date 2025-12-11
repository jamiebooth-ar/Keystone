from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Generic Booking ---
class GenericBookingBase(BaseModel):
    start_date: datetime
    end_date: datetime
    domain_id: int
    description: Optional[str] = None
    archived: bool = False

class GenericBookingCreate(GenericBookingBase):
    pass

class GenericBooking(GenericBookingBase):
    id: int
    class Config:
        from_attributes = True

# --- Page Listing ---
class PageListingBase(BaseModel):
    title: str
    associated_name: Optional[str] = None
    foreign_id: int
    inst_id: int
    page_association_type_id: int
    start_date: datetime
    end_date: datetime
    notes: Optional[str] = None
    archived: bool = False
    generic_booking_id: int

class PageListingCreate(PageListingBase):
    pass

class PageListing(PageListingBase):
    id: int
    booking: Optional[GenericBooking] = None
    class Config:
        from_attributes = True
