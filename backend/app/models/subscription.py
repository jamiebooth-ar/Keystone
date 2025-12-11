from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from app.core.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class CompassSubscription(Base):
    __tablename__ = "compass_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    subscription_name = Column(String, nullable=True)
    inst_id = Column(Integer)
    max_users = Column(Integer, default=5)
    notes = Column(Text, nullable=True)
    price = Column(Float, default=0.0)
    
    booking_id = Column(Integer, ForeignKey("generic_bookings.id"))
    
    created_by = Column(Integer)
    created_on = Column(DateTime, default=datetime.utcnow)
    updated_by = Column(Integer, nullable=True)
    updated_on = Column(DateTime, nullable=True)

class CompassSubscriptionGroup(Base):
    __tablename__ = "compass_subscription_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    subscription_id = Column(Integer, ForeignKey("compass_subscriptions.id"))
