from sqlalchemy import Column, Integer, String, Boolean, DateTime, SmallInteger
from app.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    salt = Column(String)
    hashed_password = Column(String, name="Hashed") # Keeping DB column name for potential compatibility
    
    role_id = Column(Integer)
    department_id = Column(SmallInteger)
    
    email = Column(String, unique=True, index=True)
    job_title = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    
    status = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
