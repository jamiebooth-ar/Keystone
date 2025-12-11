from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from app.core.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class Mailshot(Base):
    __tablename__ = "mailshots"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    subject = Column(String)
    content = Column(Text) # HTML content
    
    status = Column(String, default="Draft") # Draft, Scheduled, Sending, Sent, Failed
    send_date = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, nullable=True) # User ID

    # Metrics
    total_sent = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    
class EmailTemplate(Base):
    __tablename__ = "email_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    subject_line = Column(String)
    body_html = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
