from app.core.database import SessionLocal
from app.services.hubspot_service import HubSpotService

def init_db():
    print("Initializing keystone_banana.db...")
    # Just creating a session triggers table creation via app.main -> database.Base.metadata.create_all
    # But to be sure, we can verify connectivity.
    db = SessionLocal()
    print("Database initialized successfully.")
    
    # Optional: Trigger sync immediately to populate "the funny db"
    print("Starting initial HubSpot sync to populate banana db...")
    service = HubSpotService()
    try:
        service.sync_contacts_background(db)
        print("Initial sync complete!")
    except Exception as e:
        print(f"Sync warning: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
