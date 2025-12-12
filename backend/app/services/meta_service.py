import json
import os
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.orm import Session
from app.core.config import settings, BASE_DIR
from app.schemas.campaign import Campaign, CampaignList
from app.models.campaign import CampaignModel

class MetaService:
    def __init__(self):
        self.access_token = settings.META_ACCESS_TOKEN.strip().strip('"').strip("'")
        self.ad_account_id = settings.AD_ACCOUNT_ID.strip().strip('"').strip("'")
        self.api_version = "v19.0"
        self.base_url = "https://graph.facebook.com"
        
        # Absolute path for JSON backup
        self.cache_file = os.path.join(BASE_DIR, "cached_campaigns.json")

    def _save_cache_file(self, data: CampaignList):
        """Save clean campaign list to JSON file as backup"""
        try:
            with open(self.cache_file, 'w') as f:
                # Convert Pydantic models to dicts
                json_data = {
                    "Brand": [c.dict() for c in data.Brand],
                    "LeadGen": [c.dict() for c in data.LeadGen],
                    "last_updated": data.last_updated
                }
                json.dump(json_data, f)
            print(f"Saved backup cache to {self.cache_file}")
        except Exception as e:
            print(f"Failed to save backup cache: {e}")

    def _load_cache_file(self) -> Optional[CampaignList]:
        """Load from JSON backup if available"""
        if not os.path.exists(self.cache_file):
            return None
        
        try:
            with open(self.cache_file, 'r') as f:
                data = json.load(f)
                print(f"Loaded {len(data.get('Brand', [])) + len(data.get('LeadGen', []))} campaigns from JSON Backup")
                return CampaignList(**data)
        except Exception as e:
            print(f"Failed to load backup cache: {e}")
            return None
        


    def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        url = f"{self.base_url}/{self.api_version}/{endpoint}"
        if not params:
            params = {}
        params["access_token"] = self.access_token
        
        try:
            response = requests.get(url, params=params, timeout=10)
            
            # DEBUG LOGGING START
            print(f"[DEBUG] Meta API Request to {endpoint} Status: {response.status_code}")
            if response.status_code != 200:
                print(f"[DEBUG] Error Response Text: {response.text}")
            
            try:
                data = response.json()
                if "data" in data and isinstance(data["data"], list):
                     print(f"[DEBUG] Meta API returned {len(data['data'])} items for {endpoint}")
                elif "error" in data:
                     print(f"[DEBUG] Meta API Error: {data['error']}")
                else:
                     print(f"[DEBUG] Meta API Response keys: {list(data.keys())}")
                
                response.raise_for_status()
                return data
            except ValueError:
                print(f"[DEBUG] Failed to parse JSON. Raw text: {response.text}")
                response.raise_for_status()
                return {}
            # DEBUG LOGGING END

        except requests.exceptions.RequestException as e:
            print(f"Error requesting {endpoint}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            return {}

    def get_account_name(self) -> str:
        """Fetch and log the Ad Account Name for verification"""
        try:
            # We don't use 'act_' prefix for some endpoints if ID already has it? 
            # Config has it. endpoint should be just ID.
            # _make_request adds base_url/version/endpoint
            # endpoint = self.ad_account_id
            data = self._make_request(self.ad_account_id, params={"fields": "name"})
            name = data.get("name", "Unknown")
            print(f"[DEBUG] >>> CONNECTED TO AD ACCOUNT: '{name}' (ID: {self.ad_account_id}) <<<")
            return name
        except Exception as e:
            print(f"[ERROR] Could not fetch account name: {e}")
            return "Unknown"
    def fetch_active_campaigns(self) -> List[Dict]:
        """Fetch only ACTIVE campaigns with minimal fields for speed"""
        endpoint = f"{self.ad_account_id}/campaigns"
        fields = [
            "id", "name", "objective", "status", "effective_status",
            "daily_budget", "spend", "stop_time"
        ]
        params = {
            "fields": ",".join(fields),
            # "effective_status": '["ACTIVE"]', # Removed to ensure we get all campaigns
            "limit": 500 # Increased limit to capture history
        }
        
        campaigns = []
        data = self._make_request(endpoint, params)
        if data:
            campaigns.extend(data.get("data", []))
        
        return campaigns

    def _clean_campaign_name(self, name: str) -> str:
        """Remove common prefixes from campaign names"""
        # List of prefixes to remove (in order of priority - most specific first)
        prefixes_to_remove = [
            "FAU - FAM - Brand Paid Social - ",
            "FAU - FAP - Brand Paid Social - ",
            "FAU - FAM - Paid Social Brand - ",
            "FAU - FAP - Paid Social Brand - ",
            "FAU - FAM - Paid Social Lead Gen - ",
            "FAU - FAP - Paid Social Lead Gen - ",
            "FAU - FAM - Paid Social - ",
            "FAU - FAP - Paid Social - ",
            "FAU - FAM - PG LIVE - ",
            "FAU - FAP - PG LIVE - ",
            "FAU - FAM - ",
            "FAU - FAP - ",
            "FAM - Brand Paid Social - ",
            "FAP - Brand Paid Social - ",
            "FAM - Paid Social Brand - ",
            "FAP - Paid Social Brand - ",
            "FAM - Paid Social - ",
            "FAP - Paid Social - ",
            "FAM - PG LIVE - ",
            "FAP - PG LIVE - ",
            "FAM - ",
            "FAP - ",
            "Brand Paid Social - FAM - ",
            "Brand Paid Social - FAP - ",
            "Brand Social - FAP - ",
            "Brand Social - FAM - ",
            "Paid Social Lead Gen - FAM - ",
            "Paid Social Lead Gen - FAP - ",
            "Paid Social Brand - FAM - ",
            "Paid Social Brand - FAP - ",
            "Paid Social - FAM - ",
            "Paid Social - FAP - ",
            "Paid Social Brand - ",
            "Paid Social - ",
            "PG LIVE - FAM - ",
            "PG LIVE - FAP - ",
            "PG LIVE - ",
            "PG LIVE",
            "LeadGen - FAM - ",
            "LeadGen - FAP - ",
            "LeadGen - ",
            "Lead Gen - FAM - ",
            "Lead Gen - FAP - ",
            "Lead Gen - ",
            "Brand Paid Social - ",
            "Paid Social - ",
            "Brand - ",
        ]
        
        cleaned_name = name
        for prefix in prefixes_to_remove:
            if cleaned_name.startswith(prefix):
                cleaned_name = cleaned_name[len(prefix):]
                break
        
        # Also remove "PG LIVE" if it appears at the start (without dash)
        if cleaned_name.startswith("PG LIVE"):
            cleaned_name = cleaned_name[7:].strip()
        
        return cleaned_name
    
    def _extract_date(self, name: str) -> str:
        """Extract date from campaign name (everything after the last dash)"""
        import re
        
        # Find the last occurrence of " - " in the name
        if " - " in name:
            parts = name.split(" - ")
            potential_date = parts[-1].strip()
            
            # Check if this looks like a date (contains month name and/or year)
            # Pattern to match various date formats with 2 or 4 digit years
            date_pattern = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|january|february|march|april|may|june|july|august|september|october|november|december).*\d{2,4}|\d{2,4}'
            
            if re.search(date_pattern, potential_date, re.IGNORECASE):
                # Extract just the month(s) and year portion
                # Pattern: Month or Month/Month followed by 2 or 4 digit year
                clean_pattern = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))?\s*(\d{2,4})'
                match = re.search(clean_pattern, potential_date, re.IGNORECASE)
                
                if match:
                    month1 = match.group(1).capitalize()
                    month2 = match.group(2).capitalize() if match.group(2) else None
                    year = match.group(3)
                    
                    # Ensure year is 2 digits
                    if len(year) == 4:
                        year = year[2:]  # Convert 2025 to 25
                    
                    # Format as "Month Year" or "Month/Month Year"
                    if month2:
                        return f"{month1}/{month2} {year}"
                    else:
                        return f"{month1} {year}"
        
        return None
    
    def _format_date(self, date_str: str) -> str:
        """Format Meta API date string (ISO format) to readable format"""
        if not date_str:
            return None
        
        try:
            # Meta returns dates in ISO format: "2025-01-15T23:59:59+0000"
            # Use built-in datetime to parse (handles ISO format)
            dt = datetime.fromisoformat(date_str.replace('+0000', '+00:00'))
            # Format as "Mon DD" (e.g., "Jan 15")
            return dt.strftime("%b %d")
        except Exception as e:
            print(f"Error formatting date '{date_str}': {e}")
            return date_str  # Return original if parsing fails
    
    def _remove_date_from_name(self, name: str) -> str:
        """Remove date from campaign name (everything after the last dash if it's a date)"""
        import re
        
        clean_name = name
        parts = name.split(" - ")
        
        # Pattern to match various date formats with 2 or 4 digit years
        date_pattern = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|january|february|march|april|may|june|july|august|september|october|november|december).*\d{2,4}|\d{2,4}'
        
        # 1. Try to strip date from end if present
        if len(parts) > 1:
            potential_date = parts[-1].strip()
            if re.search(date_pattern, potential_date, re.IGNORECASE):
                clean_name = " - ".join(parts[:-1]).strip()
        
        # 2. Remove generic branding terms (GLOBAL FIX)
        # Verify we catch "Brand Paid Social" specifically first to avoid partial matches leaving junk
        clean_name = re.sub(r'brand\s+paid\s+social', '', clean_name, flags=re.IGNORECASE)
        clean_name = re.sub(r'paid\s+social', '', clean_name, flags=re.IGNORECASE)
        clean_name = re.sub(r'brand', '', clean_name, flags=re.IGNORECASE)

        # 3. Clean up leading/trailing separators or double separators
        # e.g. " - Campaign Name" or "Name - - part"
        clean_name = re.sub(r'^\s*[-|]\s*', '', clean_name) # Leading separator
        clean_name = re.sub(r'\s*[-|]\s*$', '', clean_name) # Trailing separator
        clean_name = re.sub(r'\s*[-|]\s*[-|]\s*', ' - ', clean_name) # Double separator

        return clean_name.strip()
    
    def _detect_brand(self, name: str, campaign_type: str = None) -> str:
        """Detect if campaign is for FAM, FAP, or FAU based on name"""
        name_upper = name.upper()
        
        # For Event campaigns, don't use FAU detection - they should show individual FAM or FAP
        # Only apply FAU detection for Brand and LeadGen campaigns
        if campaign_type != "Event":
            # Check for explicit dual brand indicators first (return FAU for FindAUniversity)
            if "FAM/FAP" in name_upper or "FAP/FAM" in name_upper:
                return "FAU"
        
        # Check for individual brand indicators
        has_fam = " FAM " in name_upper or name_upper.startswith("FAM ") or name_upper.endswith(" FAM") or "FAM -" in name_upper or "- FAM" in name_upper
        has_fap = " FAP " in name_upper or name_upper.startswith("FAP ") or name_upper.endswith(" FAP") or "FAP -" in name_upper or "- FAP" in name_upper
        
        # For non-Event campaigns, if both FAM and FAP are present, return FAU
        if campaign_type != "Event" and has_fam and has_fap:
            return "FAU"
        elif has_fam:
            return "FAM"
        elif has_fap:
            return "FAP"
        elif has_fap:
            return "FAP"
        # Default to FAU if no specific brand detected (per user request)
        return "FAU"
    
    def _fetch_batch_insights(self, batch_ids: List[str]) -> Dict[str, Dict]:
        """Helper to fetch a single batch of insights"""
        insights_map = {}
        for campaign_id in batch_ids:
            insights_endpoint = f"{campaign_id}/insights"
            insights_params = {
                "fields": "spend,impressions",
                "date_preset": "maximum"  # Use maximum for all-time data
            }
            insights_data = self._make_request(insights_endpoint, insights_params)
            
            if insights_data and "data" in insights_data and len(insights_data["data"]) > 0:
                insights_map[campaign_id] = insights_data["data"][0]
            else:
                insights_map[campaign_id] = {"spend": "0", "impressions": "0"}
        return insights_map

    def fetch_campaign_insights_batch(self, campaign_ids: List[str]) -> Dict[str, Dict]:
        """Fetch insights for multiple campaigns using parallel requests"""
        insights_map = {}
        batch_size = 50 # Meta API limit is 50, but we process per ID inside the loop, so this is just chunking for threads
        # Actually our helper processes one by one, so we can just chunk the IDs
        
        # Split campaign_ids into chunks
        chunks = [campaign_ids[i:i + batch_size] for i in range(0, len(campaign_ids), batch_size)]
        
        print(f"Starting parallel fetch with {len(chunks)} chunks...")
        start_time = datetime.now()
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            # Submit all chunks to the thread pool
            future_to_chunk = {executor.submit(self._fetch_batch_insights, chunk): chunk for chunk in chunks}
            
            for future in concurrent.futures.as_completed(future_to_chunk):
                try:
                    data = future.result()
                    insights_map.update(data)
                except Exception as exc:
                    print(f"Chunk fetch generated an exception: {exc}")
                    
        print(f"Parallel fetch completed in {(datetime.now() - start_time).total_seconds():.2f}s")
        return insights_map


    def update_campaigns_background(self, db: Session):
        """Fetch fresh data from Meta and update DB (Intended for background thread)"""
        print("Fetching live data from Meta...")
        raw_campaigns = self.fetch_active_campaigns()
        
        if not self.access_token:
            print("No Meta access token found")
            return # Assuming _get_empty_structure() is not needed here as it's a background update
        
        # Verify Account Name (Log it clearly)
        self.get_account_name()
            
        print("Fetching live data from Meta...") # This line is redundant after the first print
        
        if not raw_campaigns:
            print("No campaigns found")
            return
        
        # Fetch insights for ALL fetched campaigns
        campaign_ids = [rc["id"] for rc in raw_campaigns]
        print(f"Fetching insights for {len(campaign_ids)} campaigns...")
        insights_map = self.fetch_campaign_insights_batch(campaign_ids)
        
        # Prepare for DB bulk update/insert
        brand_campaigns_list = []
        lead_campaigns_list = []

        for rc in raw_campaigns:
            # Removed status check to ensure we get ALL campaigns (paused, archived, etc.)
            # if rc.get("effective_status") != "ACTIVE":
            #     continue

            
            name = rc.get("name", "")
            name_lower = name.lower()
            
            # Determine campaign type based on ORIGINAL name (before cleaning)
            c_type = "Brand"  # default
            
            if "pg live" in name_lower or "pglive" in name_lower:
                c_type = "Event"
            elif "lead" in name_lower or "leadgen" in name_lower:
                c_type = "LeadGen"
            elif "paid social brand" in name_lower or "brand" in name_lower:
                c_type = "Brand"
            
            # Get insights from batch results
            insight = insights_map.get(rc["id"], {})
            
            total_spend = 0.0
            total_impressions = 0
            
            try:
                total_spend = float(insight.get("spend", 0))
                total_impressions = int(insight.get("impressions", 0))
            except (ValueError, TypeError) as e:
                print(f"Error parsing insights for {name}: {e}")
            
            # Extract date from original name before cleaning
            campaign_date = self._extract_date(name)
            
            # Clean the campaign name for display
            display_name = self._clean_campaign_name(name)
            
            # Remove date from display name
            display_name = self._remove_date_from_name(display_name)
            
            # Detect brand (FAM or FAP or FAU) - pass campaign type to handle Events differently
            brand = self._detect_brand(name, c_type)
            
            # Format stop_time for display
            stop_time = rc.get("stop_time")
            formatted_stop_time = self._format_date(stop_time) if stop_time else None
            
            # Debug logging
            if stop_time:
                print(f"[DEBUG] Campaign '{display_name}': stop_time='{stop_time}' → formatted='{formatted_stop_time}'")
            
            campaign_obj = Campaign(
                id=rc["id"],
                name=display_name,
                objective=rc.get("objective"),
                status=rc["status"],
                effective_status=rc["effective_status"],
                daily_budget=float(rc.get("daily_budget", 0))/100 if rc.get("daily_budget") else 0,
                targeted_countries=[],
                countries=[],
                total_spend=round(total_spend, 2),
                total_impressions=total_impressions,
                country_count=0,
                campaign_type=c_type,  # Add campaign type for frontend filtering
                brand=brand,  # Add brand (FAM/FAP/Both)
                platform="Meta", # Default to Meta
                campaign_date=campaign_date,  # Add extracted date
                stop_time=formatted_stop_time  # Add formatted campaign end date from Meta API
            )
             
            # Create DB model
            db_model = CampaignModel(
                id=campaign_obj.id,
                name=campaign_obj.name,
                status=campaign_obj.status,
                effective_status=campaign_obj.effective_status,
                objective=campaign_obj.objective,
                daily_budget=campaign_obj.daily_budget,
                total_spend=campaign_obj.total_spend,
                total_impressions=campaign_obj.total_impressions,
                campaign_type=campaign_obj.campaign_type,
                brand=campaign_obj.brand,
                platform=campaign_obj.platform,
                campaign_date=campaign_obj.campaign_date,
                stop_time=campaign_obj.stop_time,
                country_count=campaign_obj.country_count,
                countries=campaign_obj.countries,
                targeted_countries=campaign_obj.targeted_countries,
                updated_at=datetime.utcnow()
            )
            
            try:
                db.merge(db_model) # UPSERT
                db.commit() # Commit each record individually to ensure partial success
            except Exception as e:
                print(f"Error saving campaign {name}: {e}")
                db.rollback()
            
            # Add to lists for cache file
            if c_type == "LeadGen":
                lead_campaigns_list.append(campaign_obj)
            else:
                brand_campaigns_list.append(campaign_obj)

        # Updated cache file
        self._save_cache_file(CampaignList(
            Brand=brand_campaigns_list,
            LeadGen=lead_campaigns_list,
            last_updated=datetime.now().isoformat()
        ))

        # Final commit check not needed if committing per row, but keeping clean exit
        print("Background update finished - all valid campaigns saved.")


    def get_campaigns(self, db: Session) -> CampaignList:
        # Check DB first
        # We'll consider data "fresh" if updated within last 10 minutes
        ten_mins_ago = datetime.utcnow() - timedelta(minutes=10)
        
        # Always fetch all campaigns from DB sorted by name
        db_campaigns = db.query(CampaignModel).all()
        
        is_stale = False
        if not db_campaigns:
             is_stale = True # Empty DB, must fetch
        else:
             # Check if ANY record is old (using the first one as proxy or check all)
             # Simple check: if the first record is old, trigger update
             if db_campaigns[0].updated_at < ten_mins_ago:
                 is_stale = True

        if db_campaigns:
            print(f"[DEBUG] DB Hit! Returning {len(db_campaigns)} campaigns (Stale: {is_stale})")
            
            if is_stale:
                print("Data is stale, triggering background update...")
                # We need a new session for the background thread because 'db' is scoped to request
                # However, for simplicity/safety in this context, we can just run it synchronously if we don't want to mess with scoped sessions, 
                # OR better: accept that the user sees old data and we trigger update.
                # threading.Thread(target=self.update_campaigns_background, args=(db,)).start() 
                # PASSING DB SESSION TO THREAD IS RISKY
                # For this specific task, "Stale While Revalidate" usually implies we return old data, 
                # but we need to trigger the update. 
                # To be safe with FastAPI/SQLAlchemy 'db' session dependency, we should probably do a synchronous check 
                # OR properly create a new session factory.
                
                # Given complexity, we'll do this:
                # If data exists, return it.
                # If it's stale, launch a thread that creates its ONE-OFF new session to update.
                # BUT we don't have the session factory here easily injected without more refactoring.
                
                # SIMPLIFICATION for "Perm Fix":
                # We will just return the DB data. 
                # The "Background Update" needs a fresh session.
                # We will create a fresh session inside the thread or helper.
                
                # Let's use a simple executor to run the update logic, but we need `SessionLocal`.
                from app.core.database import SessionLocal
                def bg_update():
                    print("Background update started")
                    with SessionLocal() as bg_db:
                         self.update_campaigns_background(bg_db)
                    print("Background update finished")

                executor = ThreadPoolExecutor(max_workers=1)
                executor.submit(bg_update)

            brand_campaigns = []
            lead_campaigns = []
            
            for c in db_campaigns:
                campaign_obj = Campaign(
                    id=c.id,
                    name=c.name,
                    status=c.status,
                    effective_status=c.effective_status,
                    objective=c.objective,
                    daily_budget=c.daily_budget,
                    total_spend=c.total_spend,
                    total_impressions=c.total_impressions,
                    campaign_type=c.campaign_type,
                    brand=c.brand,
                    platform=c.platform,
                    campaign_date=c.campaign_date,
                    stop_time=c.stop_time,
                    country_count=c.country_count,
                    countries=c.countries,
                    targeted_countries=c.targeted_countries
                )
                
                if c.campaign_type == "Brand" or c.campaign_type == "Event":
                    brand_campaigns.append(campaign_obj)
                elif c.campaign_type == "LeadGen":
                    lead_campaigns.append(campaign_obj)
                
            return CampaignList(
                Brand=brand_campaigns,
                LeadGen=lead_campaigns,
                last_updated=datetime.now().isoformat()
            )
        
        
        # If DB is empty, TRY JSON BACKUP FIRST
        print("[DEBUG] DB is empty! Checking JSON backup path: " + self.cache_file)
        json_backup = self._load_cache_file()
        if json_backup:
            print(f"[DEBUG] JSON Backup Hit! Returning {len(json_backup.Brand) + len(json_backup.LeadGen)} campaigns.")
            # Trigger background update to refresh DB/File
            from app.core.database import SessionLocal
            def bg_update():
               print("Background update started (from JSON fallback)")
               with SessionLocal() as bg_db:
                    self.update_campaigns_background(bg_db)
            
            executor = ThreadPoolExecutor(max_workers=1)
            executor.submit(bg_update)
            
            return json_backup

        # If BOTH are empty, we MUST block and fetch (Cold Start)
        print("[DEBUG] CRITICAL: DB and JSON Backup are empty. Blocking main thread for cold start fetch.")
        self.update_campaigns_background(db)
        
        # Fetch from DB again (Non-Recursive) to avoid infinite loop if API returns nothing
        print("[DEBUG] Cold start fetch complete. Querying DB for results...")
        db_campaigns_final = db.query(CampaignModel).all()
        
        brand_campaigns_final = []
        lead_campaigns_final = []
        
        for c in db_campaigns_final:
            campaign_obj = Campaign(
                id=c.id, name=c.name, status=c.status,
                effective_status=c.effective_status, objective=c.objective,
                daily_budget=c.daily_budget, total_spend=c.total_spend,
                total_impressions=c.total_impressions, campaign_type=c.campaign_type,
                brand=c.brand, platform=c.platform, campaign_date=c.campaign_date,
                stop_time=c.stop_time,
                country_count=c.country_count, countries=c.countries,
                targeted_countries=c.targeted_countries
            )
            if c.campaign_type == "Brand" or c.campaign_type == "Event":
                brand_campaigns_final.append(campaign_obj)
            elif c.campaign_type == "LeadGen":
                lead_campaigns_final.append(campaign_obj)
                
        return CampaignList(
            Brand=brand_campaigns_final,
            LeadGen=lead_campaigns_final,
            last_updated=datetime.now().isoformat()
        )
        
        


    def get_aggregated_stats(self, campaign_type: str, country: str) -> Dict[str, float]:
        # Return default averages for predictions
        return {
            "CPM": 12.50,
            "CPC": 1.50,
            "CPL": 25.0,
            "Frequency": 1.2
        }
        

meta_service = MetaService()
