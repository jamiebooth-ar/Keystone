from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.services.hubspot_service import HubSpotService
from app.core.database import get_db

router = APIRouter()
service = HubSpotService()

@router.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify router is working"""
    return {"status": "ok", "message": "HubSpot router is working"}

@router.get("/contacts")
async def get_contacts(
    background_tasks: BackgroundTasks,
    page: int = 0,
    pageSize: int = 100,
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

@router.get("/deals")
async def get_deals(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Fetch deals from HubSpot CRM.
    Returns deals from database, triggers background sync.
    """
    try:
        # Trigger background sync (non-blocking)
        background_tasks.add_task(service.sync_deals_background, db)
        
        # Return current DB data immediately
        return service.get_deals_from_db(db)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch deals: {str(e)}")
