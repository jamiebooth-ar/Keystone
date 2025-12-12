from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Banner ---
class SplashBannerBase(BaseModel):
    name: str
    image_url: str
    target_url: str
    weight: int = 1
    is_active: bool = True

class SplashBannerCreate(SplashBannerBase):
    pass

class SplashBanner(SplashBannerBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Popup ---
class MarketingPopupBase(BaseModel):
    title: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    target_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True
    target_domains: Optional[str] = None
    target_countries: Optional[str] = None

class MarketingPopupCreate(MarketingPopupBase):
    pass

class MarketingPopup(MarketingPopupBase):
    id: int
    class Config:
        from_attributes = True
