import sys
import os

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
# Import all models to ensure they are registered with Base.metadata
from app.models import Deal, CampaignModel, Contact, User, Event, GeoLocation, Order, SplashBanner, GenericBooking, BenchmarkStats, Mailshot, PageTemplate, CompassSubscription

def init():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

if __name__ == "__main__":
    init()
