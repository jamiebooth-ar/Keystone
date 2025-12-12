"""
Sync ALL HubSpot deals to keystone_banana.db
Run this once to populate the database with all 92k deals
"""
import requests
from app.core.database import SessionLocal
from app.models import Deal
from datetime import datetime
from sqlalchemy import desc

def sync_all_deals():
    """Fetch ALL deals from HubSpot and save to database"""
    db = SessionLocal()
    
    try:
        import os
        from dotenv import load_dotenv
        load_dotenv()
        access_token = os.getenv("HUBSPOT_ACCESS_TOKEN")
        
        if not access_token:
            print("Error: HUBSPOT_ACCESS_TOKEN not found in .env")
            return
        
        # Use basic GET API (not search) to avoid 10k limit
        url = "https://api.hubapi.com/crm/v3/objects/deals"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        print("Starting to fetch ALL deals from HubSpot...")
        print("This may take 10-15 minutes for 92k deals...")
        
        all_deals = []
        after = None
        iteration = 0
        
        while True:
            params = {
                "limit": 100,
                "properties": "dealname,amount,dealstage,createdate,closedate,pipeline",
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
                    print("No more results")
                    break
                
                all_deals.extend(results)
                iteration += 1
                
                if iteration % 10 == 0:
                    print(f"Fetched {len(all_deals)} deals so far...")
                
                # Check for pagination
                paging = data.get("paging", {})
                next_page = paging.get("next", {})
                after = next_page.get("after")
                
                if not after:
                    print("Reached end of results")
                    break
                    
            except requests.exceptions.HTTPError as e:
                print(f"HTTP Error at {len(all_deals)} deals: {e}")
                break
            except Exception as e:
                print(f"Error at {len(all_deals)} deals: {e}")
                break
        
        print(f"\n✓ Fetched {len(all_deals)} total deals from HubSpot")
        
        # Clear existing deals
        print("Clearing existing deals...")
        db.query(Deal).delete()
        db.commit()
        
        # Save to database
        print("Saving to database...")
        saved_count = 0
        errors = 0
        
        for deal_data in all_deals:
            try:
                deal_id = deal_data.get("id")
                props = deal_data.get("properties", {})
                
                # Parse dates
                create_date = None
                if props.get("createdate"):
                    try:
                        create_date = datetime.fromisoformat(props.get("createdate").replace('Z', '+00:00'))
                    except:
                        pass
                
                close_date = None
                if props.get("closedate"):
                    try:
                        close_date = datetime.fromisoformat(props.get("closedate").replace('Z', '+00:00'))
                    except:
                        pass
                
                # Parse amount
                amount = 0.0
                if props.get("amount"):
                    try:
                        amount = float(props.get("amount"))
                    except:
                        amount = 0.0
                
                new_deal = Deal(
                    id=deal_id,
                    dealname=props.get("dealname", ""),
                    amount=amount,
                    dealstage=props.get("dealstage", ""),
                    createdate=create_date,
                    closedate=close_date,
                    pipeline=props.get("pipeline", "")
                )
                db.add(new_deal)
                saved_count += 1
                
                # Commit in batches
                if saved_count % 1000 == 0:
                    db.commit()
                    print(f"Saved {saved_count} deals...")
                    
            except Exception as e:
                errors += 1
                if errors < 10:  # Only print first 10 errors
                    print(f"Error saving deal {deal_id}: {e}")
                continue
        
        # Final commit
        db.commit()
        print(f"\n✓ Successfully saved {saved_count} deals to keystone_banana.db")
        print(f"✓ Errors: {errors}")
        
        # Verify
        count = db.query(Deal).count()
        print(f"✓ Verified: {count} deals in database")
        
    except Exception as e:
        print(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    sync_all_deals()
