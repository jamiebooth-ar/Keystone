from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from app.services.hubspot_service import HubSpotService
from app.core.database import get_db

router = APIRouter()
service = HubSpotService()

@router.get("/contacts")
async def get_contacts(
    background_tasks: BackgroundTasks,
    page: int = Query(0, ge=0),
    pageSize: int = Query(100, le=1000),
    db: Session = Depends(get_db)
):
    """
    Returns paginated contacts from local DB.
    Triggers a background sync from HubSpot.
    """
    try:
        # Trigger background sync (non-blocking)
        background_tasks.add_task(service.sync_contacts_background, db)
        
        # Return current DB data immediately
        return service.get_contacts_paginated(db, skip=page * pageSize, limit=pageSize)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
