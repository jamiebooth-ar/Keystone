from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class GeoLocationBase(BaseModel):
    name: str
    friendly_name: Optional[str] = None
    location_type_id: int
    location_code: Optional[str] = None
    nationality: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    archived: bool = False
    parent_id: Optional[int] = None

class GeoLocationCreate(GeoLocationBase):
    pass

class GeoLocationInDBBase(GeoLocationBase):
    id: int

    class Config:
        from_attributes = True

class GeoLocation(GeoLocationInDBBase):
    pass
