from app.core.database import SessionLocal
from app.models.contact import Contact
from app.core.config import settings
import os

def check_banana():
    print(f"Checking DB at: {settings.DATABASE_URL}")
    if "keystone_banana.db" not in settings.DATABASE_URL:
        print("WARNING: Config does not seem to point to banana db?")
        
    try:
        db = SessionLocal()
        count = db.query(Contact).count()
        print(f"Total Contacts in Banana DB: {count}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_banana()
