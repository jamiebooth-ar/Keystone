import requests
import os
import json
from hubspot import HubSpot
import time
from app.core.config import settings
from sqlalchemy.orm import Session
from app.models.contact import Contact
import re

class HubSpotService:
    def __init__(self):
        # Using provided access token
        self.access_token = os.getenv("HUBSPOT_ACCESS_TOKEN")
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




    def sync_deals_background(self, db: Session):
        """
        Fetch ALL deals from HubSpot and save to database.
        Fetches all 92k+ deals using pagination.
        """
        try:
            from app.models.deal import Deal
            from datetime import datetime
            
            # HubSpot REST API endpoint
            url = "https://api.hubapi.com/crm/v3/objects/deals"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            properties = "dealname,amount,dealstage,createdate,closedate,pipeline"
            
            all_deals = []
            after = None
            page_count = 0
            
            print(f"Fetching ALL deals from HubSpot (Account: 9451951)...")
            print(f"Using token: {self.access_token[:20]}...")
            
            while True:  # Get ALL deals
                params = {
                    "limit": 100,
                    "properties": properties,
                    "archived": "false"
                }
                
                if after:
                    params["after"] = after
                
                try:
                    response = requests.get(url, headers=headers, params=params)
                    
                    if response.status_code != 200:
                        print(f"Error on page {page_count + 1}: {response.text}")
                        break
                    
                    data = response.json()
                    results = data.get("results", [])
                    
                    # Save to database
                    for deal_data in results:
                        props = deal_data.get("properties", {})
                        
                        deal = Deal(
                            id=deal_data.get("id"),
                            dealname=props.get("dealname"),
                            amount=float(props.get("amount", 0)) if props.get("amount") else None,
                            dealstage=props.get("dealstage"),
                            createdate=datetime.fromisoformat(props["createdate"].replace("Z", "+00:00")) if props.get("createdate") else None,
                            closedate=datetime.fromisoformat(props["closedate"].replace("Z", "+00:00")) if props.get("closedate") else None,
                            pipeline=props.get("pipeline")
                        )
                        db.merge(deal)
                    
                    db.commit()
                    page_count += 1
                    all_deals.extend(results)
                    
                    print(f"Page {page_count}: Saved {len(results)} deals (Total: {len(all_deals)})")
                    
                    # Check for pagination
                    paging = data.get("paging", {})
                    if not paging or "next" not in paging:
                        print(f"✓ Completed! Fetched all {len(all_deals)} deals")
                        break
                    
                    after = paging["next"]["after"]
                    time.sleep(0.2)  # Rate limiting
                    
                except requests.exceptions.RequestException as e:
                    print(f"Request failed on page {page_count + 1}: {e}")
                    break
            
        except Exception as e:
            print(f"Error syncing deals: {e}")
            import traceback
            traceback.print_exc()
            db.rollback()
    
    
    def get_deals_from_db(self, db: Session):
        """
        Return deals from database.
        """
        from app.models.deal import Deal
        
        deals = db.query(Deal).all()
        
        return {
            "results": [
                {
                    "id": deal.id,
                    "properties": {
                        "dealname": deal.dealname,
                        "amount": str(deal.amount) if deal.amount else "0",
                        "dealstage": deal.dealstage,
                        "createdate": deal.createdate.isoformat() if deal.createdate else None,
                        "closedate": deal.closedate.isoformat() if deal.closedate else None,
                        "pipeline": deal.pipeline
                    }
                }
                for deal in deals
            ]
        }
