import sys
import os

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.core.database import SessionLocal
from app.services.meta_service import meta_service

def sync_meta():
    print("Starting Meta Campaign Sync...")
    
    # Create DB session
    db = SessionLocal()
    try:
        # Run sync synchronously here
        meta_service.update_campaigns_background(db)
        print("Meta Sync Completed Successfully.")
    except Exception as e:
        print(f"Meta Sync Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    sync_meta()
