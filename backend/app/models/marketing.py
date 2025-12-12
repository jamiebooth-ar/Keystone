from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from app.core.database import Base
from datetime import datetime

class SplashBanner(Base):
    __tablename__ = "splash_banners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    image_url = Column(String)
    target_url = Column(String)
    weight = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MarketingPopup(Base):
    __tablename__ = "marketing_popups"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text, nullable=True) # HTML content or invalid
    image_url = Column(String, nullable=True)
    target_url = Column(String, nullable=True)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Targeting (Simplified from CMS4's complex domains/locations)
    target_domains = Column(String, nullable=True) # e.g. "FindAMasters, FindAPhD"
    target_countries = Column(String, nullable=True) # e.g. "GB, DE"
