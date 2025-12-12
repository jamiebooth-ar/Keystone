from typing import Any, List
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import email as email_schema
from app.models import email as email_model
import time

router = APIRouter()

def fake_send_email(mailshot_id: int, db: Session):
    """
    Simulate background email sending.
    """
    time.sleep(5) # Simulate processing
    mailshot = db.query(email_model.Mailshot).filter(email_model.Mailshot.id == mailshot_id).first()
    if mailshot:
        mailshot.status = "Sent"
        mailshot.total_sent = 1542 # Fake successful send count
        db.commit()

@router.get("/mailshots/", response_model=List[email_schema.Mailshot])
def read_mailshots(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    return db.query(email_model.Mailshot).offset(skip).limit(limit).all()

@router.post("/mailshots/", response_model=email_schema.Mailshot)
def create_mailshot(
    *,
    db: Session = Depends(get_db),
    mailshot_in: email_schema.MailshotCreate
) -> Any:
    mailshot = email_model.Mailshot(**mailshot_in.model_dump())
    db.add(mailshot)
    db.commit()
    db.refresh(mailshot)
    return mailshot

@router.post("/mailshots/{id}/send")
def send_mailshot(
    id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Any:
    mailshot = db.query(email_model.Mailshot).filter(email_model.Mailshot.id == id).first()
    if not mailshot:
        return {"error": "Mailshot not found"}
        
    mailshot.status = "Sending"
    db.commit()
    
    background_tasks.add_task(fake_send_email, id, db)
    
    return {"message": "Email sending started", "status": "Sending"}
