from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, DateTime
from app.core.database import Base
from datetime import datetime

class CampaignModel(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    status = Column(String)
    effective_status = Column(String)
    objective = Column(String, nullable=True)
    daily_budget = Column(Float, default=0.0)
    total_spend = Column(Float, default=0.0)
    total_impressions = Column(Integer, default=0)
    campaign_type = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    platform = Column(String, default="Meta")
    campaign_date = Column(String, nullable=True)
    stop_time = Column(String, nullable=True)
    country_count = Column(Integer, default=0)
    # Store complex lists as JSON
    countries = Column(JSON, default=list)
    targeted_countries = Column(JSON, default=list)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
