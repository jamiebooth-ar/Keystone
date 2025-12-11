from fastapi import APIRouter
from app.api.v1 import campaigns, events, users, locations, orders, auth, marketing, bookings, analytics, email, content, hubspot

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(email.router, prefix="/email", tags=["email"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(marketing.router, prefix="/marketing", tags=["marketing"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(hubspot.router, prefix="/hubspot", tags=["hubspot"])

# Add debug/admin if needed, extracting from old routes.py
from app.api.routes import get_debug_info
api_router.add_api_route("/debug", get_debug_info, tags=["system"], methods=["GET"])
