from sqlalchemy import Column, Integer, String, Boolean, Numeric, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship

class GeoLocation(Base):
    __tablename__ = "geolocations"

    id = Column(Integer, primary_key=True, index=True, name="GeoLocationId")
    name = Column(String)
    parent_id = Column(Integer, ForeignKey("geolocations.GeoLocationId"), nullable=True, name="Parent")
    friendly_name = Column(String, nullable=True, name="FriendlyName")
    
    location_type_id = Column(Integer, name="LocationType")
    location_code = Column(String, nullable=True, name="Code")
    nationality = Column(String, nullable=True, name="Nationality")
    
    latitude = Column(Numeric(9, 6), nullable=True, name="Latitude")
    longitude = Column(Numeric(9, 6), nullable=True, name="Longitude")
    
    archived = Column(Boolean, default=False, name="Archived")

    # Self-referential relationship
    parent = relationship("GeoLocation", remote_side=[id], backref="children")
