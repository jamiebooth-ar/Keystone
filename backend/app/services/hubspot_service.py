from hubspot import HubSpot
import time
from app.core.config import settings
from sqlalchemy.orm import Session
from app.models.contact import Contact
import re

class HubSpotService:
    def __init__(self):
        # NOTE: In production, store this in .env. Hardcoded for prototype as requested.
        self.access_token = os.getenv("HUBSPOT_ACCESS_TOKEN", "your_token_here")
        self.client = HubSpot(access_token=self.access_token)

    def clean_phone(self, phone: str) -> str:
        if not phone:
            return ""
        # Remove all non-digit characters
        return re.sub(r'\D', '', phone)


    def sync_contacts_background(self, db: Session):
        """
        Background task to fetch all contacts from HubSpot and update local DB.
        Runs silently.
        """
        properties = ["firstname", "lastname", "email", "phone", "company", "jobtitle"]
        all_contacts = []
        after = None
        
        print("Starting HubSpot Background Sync...")
        try:
            while True:
                # Rate limit protection: HubSpot Public API tier ~10 req/sec, but let's be safe
                time.sleep(0.5) 
                
                api_response = self.client.crm.contacts.basic_api.get_page(
                    limit=100,
                    after=after,
                    properties=properties,
                    archived=False
                )
                all_contacts.extend(api_response.results)
                
                if not api_response.paging:
                    break
                after = api_response.paging.next.after
            
            print(f"Fetched {len(all_contacts)} contacts. Saving to DB...")

            for contact in all_contacts:
                props = contact.properties
                phone_raw = props.get("phone")
                
                db_contact = Contact(
                    id=contact.id,
                    first_name=props.get("firstname") or "",
                    last_name=props.get("lastname") or "",
                    email=props.get("email") or "",
                    phone=self.clean_phone(phone_raw),
                    company=props.get("company") or "",
                    job_title=props.get("jobtitle") or ""
                )
                db.merge(db_contact)
            
            db.commit()
            print("HubSpot Background Sync Complete.")
            
        except Exception as e:
            print(f"Error syncing HubSpot contacts: {e}")
            db.rollback()


    def get_contacts_paginated(self, db: Session, skip: int = 0, limit: int = 100):
        """
        Return contacts from local DB with pagination.
        """
        total = db.query(Contact).count()
        contacts = db.query(Contact).offset(skip).limit(limit).all()
        
        return {
            "items": [
                {
                    "id": c.id,
                    "firstName": c.first_name,
                    "lastName": c.last_name,
                    "email": c.email,
                    "phone": c.phone,
                    "company": c.company,
                    "jobTitle": c.job_title,
                    "hubspotUrl": f"https://app.hubspot.com/contacts/{settings.HUBSPOT_ACCOUNT_ID}/contact/{c.id}"
                }
                for c in contacts
            ],
            "total": total
        }
