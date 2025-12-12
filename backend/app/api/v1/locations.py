from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import location as location_schema
from app.models import location as location_model

router = APIRouter()

@router.get("/", response_model=List[location_schema.GeoLocation])
def read_locations(
    parent_id: int = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve locations (optionally filter by parent).
    """
    query = db.query(location_model.GeoLocation)
    if parent_id is not None:
        query = query.filter(location_model.GeoLocation.parent_id == parent_id)
    
    locations = query.offset(skip).limit(limit).all()
    return locations

@router.post("/", response_model=location_schema.GeoLocation)
def create_location(
    *,
    db: Session = Depends(get_db),
    location_in: location_schema.GeoLocationCreate
) -> Any:
    """
    Create new location (City, Country, etc).
    """
    loc = location_model.GeoLocation(**location_in.model_dump())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc
