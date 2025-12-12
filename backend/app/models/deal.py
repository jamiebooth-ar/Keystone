from sqlalchemy import Column, String, Float, DateTime
from app.core.database import Base
from datetime import datetime

class Deal(Base):
    __tablename__ = "deals"
    
    id = Column(String, primary_key=True, index=True)
    dealname = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    dealstage = Column(String, nullable=True)
    createdate = Column(DateTime, nullable=True)
    closedate = Column(DateTime, nullable=True)
    pipeline = Column(String, nullable=True)
    synced_at = Column(DateTime, default=datetime.utcnow)
