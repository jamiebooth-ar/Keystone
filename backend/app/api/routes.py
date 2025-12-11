from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from sqlalchemy.orm import Session
from app.core.database import get_db
from pydantic import BaseModel
from app.services.meta_service import meta_service
from app.services.event_service import event_service
from app.services.prediction_service import prediction_service
from app.schemas.campaign import CampaignList

router = APIRouter()

class PredictionRequest(BaseModel):
    campaign_type: str
    countries: List[str]
    allocations: Dict[str, float]
    duration: int

@router.get("/campaigns", response_model=CampaignList)
def get_campaigns(db: Session = Depends(get_db)):
    """Get all current campaigns from Meta (or Mock)."""
    return meta_service.get_campaigns(db)

@router.get("/events")
def get_events():
    """Get external events."""
    return event_service.fetch_events()

@router.get("/debug")
def get_debug_info(db: Session = Depends(get_db)):
    """Return debug info about system state."""
    import os
    from app.core.config import settings, BASE_DIR
    from app.models.campaign import CampaignModel
    
    db_count = db.query(CampaignModel).count()
    cache_path = os.path.join(BASE_DIR, "cached_campaigns.json")
    cache_exists = os.path.exists(cache_path)
    
    return {
        "db_path": settings.DATABASE_URL,
        "db_count": db_count,
        "cache_path": cache_path,
        "cache_exists": cache_exists,
        "base_dir": BASE_DIR
    }

@router.post("/predict")
def predict_performance(request: PredictionRequest):
    """Calculate performance predictions."""
    try:
        return prediction_service.calculate_predictions(
            request.campaign_type,
            request.countries,
            request.allocations,
            request.duration
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
