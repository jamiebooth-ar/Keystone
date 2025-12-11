from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import booking as booking_schema
from app.models import booking as booking_model

router = APIRouter()

@router.get("/", response_model=List[booking_schema.PageListing])
def read_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve page listings (bookings).
    """
    return db.query(booking_model.PageListing).offset(skip).limit(limit).all()

@router.post("/", response_model=booking_schema.PageListing)
def create_booking(
    *,
    db: Session = Depends(get_db),
    booking_in: booking_schema.PageListingCreate
) -> Any:
    """
    Create a new page listing.
    """
    # 1. Ensure GenericBooking exists or create one (Simplified logic: Assuming client passes existing ID or we create minimal one)
    # For now, let's assume the client might not handle the complex relation.
    # In a real app, we might create the GenericBooking wrapper first.
    
    if booking_in.generic_booking_id == 0:
        # Create parent generic booking
        gen_booking = booking_model.GenericBooking(
            start_date=booking_in.start_date,
            end_date=booking_in.end_date,
            domain_id=1, # Default
            description=f"Auto-created for {booking_in.title}"
        )
        db.add(gen_booking)
        db.flush()
        booking_in.generic_booking_id = gen_booking.id

    booking = booking_model.PageListing(**booking_in.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking
