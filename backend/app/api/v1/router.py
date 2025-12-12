from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1 import campaigns, events, users, locations, orders, auth, marketing, bookings, analytics, email, content, hubspot
from app.routes import database

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(database.router, prefix="/database", tags=["database"])
api_router.include_router(email.router, prefix="/email", tags=["email"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(marketing.router, prefix="/marketing", tags=["marketing"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(hubspot.router, prefix="/hubspot", tags=["hubspot"])


# Inline debug endpoint
@api_router.get("/debug", tags=["system"])
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
