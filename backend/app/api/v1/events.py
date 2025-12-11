from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import event as event_schema
from app.models import event as event_model
from app.services.event_service import event_service as legacy_event_service

router = APIRouter()

@router.get("/", response_model=List[event_schema.Event])
def read_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve events (CMS4 Logic).
    """
    events = db.query(event_model.Event).offset(skip).limit(limit).all()
    return events

@router.post("/", response_model=event_schema.Event)
def create_event(
    *,
    db: Session = Depends(get_db),
    event_in: event_schema.EventCreate
) -> Any:
    """
    Create new event (CMS4 Logic).
    """
    event = event_model.Event(**event_in.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/{id}", response_model=event_schema.Event)
def read_event(
    *,
    db: Session = Depends(get_db),
    id: int
) -> Any:
    """
    Get event by ID.
    """
    event = db.query(event_model.Event).filter(event_model.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/stats/legacy")
def read_legacy_event_stats() -> Any:
    """
    Get external event stats (Legacy Keystone Logic).
    """
    return legacy_event_service.fetch_events()
