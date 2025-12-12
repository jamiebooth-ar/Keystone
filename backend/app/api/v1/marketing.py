from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import marketing as marketing_schema
from app.models import marketing as marketing_model

router = APIRouter()

# --- Popups ---
@router.get("/popups/", response_model=List[marketing_schema.MarketingPopup])
def read_popups(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    return db.query(marketing_model.MarketingPopup).offset(skip).limit(limit).all()

@router.post("/popups/", response_model=marketing_schema.MarketingPopup)
def create_popup(
    *,
    db: Session = Depends(get_db),
    popup_in: marketing_schema.MarketingPopupCreate
) -> Any:
    popup = marketing_model.MarketingPopup(**popup_in.model_dump())
    db.add(popup)
    db.commit()
    db.refresh(popup)
    return popup

# --- Banners ---
@router.get("/banners/", response_model=List[marketing_schema.SplashBanner])
def read_banners(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    return db.query(marketing_model.SplashBanner).offset(skip).limit(limit).all()

@router.post("/banners/", response_model=marketing_schema.SplashBanner)
def create_banner(
    *,
    db: Session = Depends(get_db),
    banner_in: marketing_schema.SplashBannerCreate
) -> Any:
    banner = marketing_model.SplashBanner(**banner_in.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner
