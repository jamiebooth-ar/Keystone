from pydantic import BaseModel
from typing import List, Optional

class InsightBase(BaseModel):
    spend: float
    impressions: int
    reach: int
    cpm: float
    frequency: float
    link_clicks: int
    ctr: float
    cpc: float
    leads: int
    cpl: float
    conversions: int
    cvr: float

class CountryInsight(InsightBase):
    country: str
    is_targeted: bool
    recent_7d_cpm: float

class CampaignBase(BaseModel):
    id: str
    name: str
    objective: Optional[str] = None
    status: str
    effective_status: str
    daily_budget: Optional[float] = None
    lifetime_budget: Optional[float] = None
    start_time: Optional[str] = None
    stop_time: Optional[str] = None
    targeted_countries: List[str] = []

class Campaign(CampaignBase):
    countries: List[CountryInsight] = []
    total_spend: float
    total_impressions: int
    country_count: int
    campaign_type: Optional[str] = None  # Brand, LeadGen, or Event
    brand: Optional[str] = None  # FAM, FAP, or FAU
    platform: str = "Meta"  # Meta, TikTok, YouTube
    campaign_date: Optional[str] = None  # Extracted date from campaign name


class CampaignList(BaseModel):
    Brand: List[Campaign]
    LeadGen: List[Campaign]
    last_updated: str
