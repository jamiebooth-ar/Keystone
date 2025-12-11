from app.core.database import SessionLocal
from app.services.hubspot_service import HubSpotService
from app.services.meta_service import MetaService
from app.models.contact import Contact
from app.models.campaign import CampaignModel

def sync_all():
    db = SessionLocal()
    print("==========================================")
    print("STARTING EXPLICIT DATA SYNC")
    print("Database: keystone_banana.db")
    print("==========================================")

    try:
        # 1. HubSpot Sync
        print("\n[1/2] Syncing HubSpot Contacts...")
        hs_service = HubSpotService()
        # Modifying the service slightly for this script? 
        # No, the existing method prints to stdout, so we will see it.
        hs_service.sync_contacts_background(db)
        
        count_contacts = db.query(Contact).count()
        print(f"✅ HubSpot Sync Complete. Total Contacts: {count_contacts}")

        # 2. Meta Sync
        print("\n[2/2] Syncing Meta Campaigns...")
        meta_service = MetaService()
        meta_service.update_campaigns_background(db)
        
        count_campaigns = db.query(CampaignModel).count()
        print(f"✅ Meta Sync Complete. Total Campaigns: {count_campaigns}")

        print("\n==========================================")
        print("ALL DATA SYNCED SUCCESSFULLY")
        print("==========================================")

    except Exception as e:
        print(f"\n❌ ERROR during sync: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sync_all()
