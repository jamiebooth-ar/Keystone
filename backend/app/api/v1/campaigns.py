from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.core.database import get_db
from app.schemas.campaign import CampaignList
from app.services.meta_service import meta_service
from app.services.prediction_service import prediction_service
from pydantic import BaseModel

router = APIRouter()

class PredictionRequest(BaseModel):
    campaign_type: str
    countries: List[str]
    allocations: Dict[str, float]
    duration: int

@router.get("/", response_model=CampaignList)
def get_campaigns(db: Session = Depends(get_db)):
    """Get all current campaigns."""
    return meta_service.get_campaigns(db)

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
