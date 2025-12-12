from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MailshotBase(BaseModel):
    title: str
    subject: str
    content: str
    send_date: Optional[datetime] = None

class MailshotCreate(MailshotBase):
    pass

class Mailshot(MailshotBase):
    id: int
    status: str
    created_at: datetime
    total_sent: int
    total_opened: int
    total_clicked: int
    class Config:
        from_attributes = True

class EmailTemplateBase(BaseModel):
    name: str
    subject_line: str
    body_html: str

class EmailTemplateCreate(EmailTemplateBase):
    pass

class EmailTemplate(EmailTemplateBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
