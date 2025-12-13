"""
Sync ALL HubSpot contacts to keystone_banana.db
"""
import sys
import os
import requests
from datetime import datetime
from sqlalchemy import desc

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.core.database import SessionLocal
from app.models import Contact

def sync_all_contacts():
    """Fetch ALL contacts from HubSpot and save to database"""
    db = SessionLocal()
    
    try:
        access_token = os.getenv("HUBSPOT_ACCESS_TOKEN")
        
        if not access_token:
            print("Error: HUBSPOT_ACCESS_TOKEN not found in .env")
            return
        
        url = "https://api.hubapi.com/crm/v3/objects/contacts"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        print("Starting to fetch ALL contacts from HubSpot...")
        
        all_contacts = []
        after = None
        iteration = 0
        
        while True:
            params = {
                "limit": 100,
                "properties": "firstname,lastname,email,phone,company,jobtitle",
                "archived": "false"
            }
            if after:
                params["after"] = after
            
            try:
                response = requests.get(url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = data.get("results", [])
                if not results:
                    break
                
                all_contacts.extend(results)
                iteration += 1
                
                if iteration % 10 == 0:
                    print(f"Fetched {len(all_contacts)} contacts so far...")
                
                paging = data.get("paging", {})
                next_page = paging.get("next", {})
                after = next_page.get("after")
                
                if not after:
                    break
                    
            except Exception as e:
                print(f"Error at {len(all_contacts)} contacts: {e}")
                break
        
        print(f"\n✓ Fetched {len(all_contacts)} total contacts from HubSpot")
        
        # Clear existing contacts
        print("Clearing existing contacts...")
        db.query(Contact).delete()
        db.commit()
        
        # Save to database
        print("Saving to database...")
        saved_count = 0
        errors = 0
        
        for contact_data in all_contacts:
            try:
                contact_id = contact_data.get("id")
                props = contact_data.get("properties", {})
                
                new_contact = Contact(
                    id=contact_id,
                    first_name=props.get("firstname"),
                    last_name=props.get("lastname"),
                    email=props.get("email"),
                    phone=props.get("phone"),
                    company=props.get("company"),
                    job_title=props.get("jobtitle")
                )
                db.add(new_contact)
                saved_count += 1
                
                if saved_count % 1000 == 0:
                    db.commit()
                    print(f"Saved {saved_count} contacts...")
                    
            except Exception as e:
                errors += 1
                if errors < 10:
                    print(f"Error saving contact {contact_id}: {e}")
                continue
        
        db.commit()
        print(f"\n✓ Successfully saved {saved_count} contacts to keystone_banana.db")
        print(f"✓ Errors: {errors}")
        
    except Exception as e:
        print(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    sync_all_contacts()
