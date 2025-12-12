from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.core.database import Base
from datetime import datetime

class PageTemplate(Base):
    __tablename__ = "page_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(Text) # HTML content
    created_by = Column(Integer)
    created_on = Column(DateTime, default=datetime.utcnow)
    modified_on = Column(DateTime, default=datetime.utcnow)
    archived = Column(Boolean, default=False)
    domains = Column(Integer) # Bitmask for domains
    mode = Column(Integer) # Email vs Web

class BespokePage(Base):
    __tablename__ = "bespoke_pages"

    id = Column(Integer, primary_key=True, index=True, name="bpid")
    type_id = Column(Integer)
    title = Column(String)
    sub_heading = Column(String, nullable=True)
    image_source = Column(String, nullable=True)
    url = Column(String, nullable=True)
    domain_flag = Column(Integer)
    hidden = Column(Boolean, default=False)
