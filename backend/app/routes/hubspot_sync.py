# HubSpot Full Sync Endpoint
# This endpoint will sync ALL data from HubSpot: Deals, Contacts, Companies, etc.

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.services.hubspot_service import HubSpotService
from app.core.database import get_db

router = APIRouter()
service = HubSpotService()

@router.post("/sync-all")
async def sync_all_hubspot_data(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Trigger a full sync of ALL HubSpot data:
    - All Deals (92k+)
    - All Contacts
    - Companies (future)
    - Products (future)
    
    This runs in the background and saves everything to keystone_banana.db
    """
    try:
        # Trigger comprehensive background sync
        background_tasks.add_task(service.sync_all_hubspot_data, db)
        
        return {
            "message": "Full HubSpot sync started in background",
            "status": "syncing",
            "items": ["deals", "contacts"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start sync: {str(e)}")

@router.get("/sync-status")
async def get_sync_status(db: Session = Depends(get_db)):
    """
    Get the current status of HubSpot data in database
    """
    try:
        from app.models.deal import Deal
        from app.models.contact import Contact
        
        deal_count = db.query(Deal).count()
        contact_count = db.query(Contact).count()
        
        return {
            "deals": deal_count,
            "contacts": contact_count,
            "total_records": deal_count + contact_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")
