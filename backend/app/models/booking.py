from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from app.core.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class GenericBooking(Base):
    __tablename__ = "generic_bookings"

    id = Column(Integer, primary_key=True, index=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    archived = Column(Boolean, default=False)
    domain_id = Column(Integer, name="Domain")
    description = Column(String, nullable=True)
    created_by = Column(Integer, nullable=True)
    
    # Relationships
    page_listings = relationship("PageListing", back_populates="booking")

class PageListing(Base):
    __tablename__ = "page_listings"

    id = Column(Integer, primary_key=True, index=True, name="PageListingBookingId")
    page_listing_id = Column(Integer, name="PageListingId", nullable=True) # Legacy ID
    generic_booking_id = Column(Integer, ForeignKey("generic_bookings.id"))
    
    title = Column(String)
    associated_name = Column(String, nullable=True)
    
    foreign_id = Column(Integer, name="ForeignId") # ID of the Dept/Inst
    inst_id = Column(Integer, name="InstId")
    page_association_type_id = Column(Integer, name="PageAssociationTypeId") # 2=Dept, 3=Inst?
    
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    notes = Column(Text, nullable=True)
    archived = Column(Boolean, default=False)
    
    booking = relationship("GenericBooking", back_populates="page_listings")
