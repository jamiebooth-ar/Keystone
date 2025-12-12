from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, Numeric
from app.core.database import Base
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, nullable=True)
    name = Column(String, index=True)
    
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    location_building = Column(String, nullable=True)
    city = Column(String, nullable=True)
    address = Column(String, nullable=True)
    post_code = Column(String, nullable=True)
    
    type_id = Column(Integer) # Byte in C#, Integer is fine here
    
    stand_limit = Column(Integer, nullable=True)
    external_url = Column(String, nullable=True)
    floor_plan_url = Column(String, nullable=True)
    
    standard_price = Column(Numeric(10, 2), nullable=True)
    early_bird_price = Column(Numeric(10, 2), nullable=True)
    early_bird_expires = Column(DateTime, nullable=True)
    
    email_confirmation_text = Column(Text, nullable=True)
    status_id = Column(Integer) # EventActiveState
    
    url_label = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    stand_power_price = Column(Numeric(10, 2), nullable=True)
    registration_state = Column(Integer)
    
    live_video_url = Column(String, nullable=True)
    post_video_url = Column(String, nullable=True)
    summary_desc = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
