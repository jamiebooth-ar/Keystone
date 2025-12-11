from app.core.database import SessionLocal
from app.models.contact import Contact
from app.models.campaign import CampaignModel
from app.core.config import settings
import os

def check_counts():
    print(f"Checking DB: {settings.DATABASE_URL}")
    db = SessionLocal()
    try:
        contact_count = db.query(Contact).count()
        campaign_count = db.query(CampaignModel).count()
        
        print(f"\n📢 CURRENT DATABASE STATUS:")
        print(f"   👥 HubSpot Contacts:  {contact_count}")
        print(f"   📊 Meta Campaigns:    {campaign_count}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_counts()
