from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.models import CampaignModel, User, Event, GeoLocation, Order, Product, OrderDetail, SplashBanner, MarketingPopup, GenericBooking, PageListing, BenchmarkStats, InstitutionBenchmark, Mailshot, EmailTemplate, PageTemplate, BespokePage, CompassSubscription

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/")
def root():
    return {"message": "Welcome to Keystone Ad Ops API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from app.api.v1.router import api_router

app.include_router(api_router, prefix="/api/v1")
