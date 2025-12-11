from pydantic_settings import BaseSettings
from typing import List

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Settings(BaseSettings):
    PROJECT_NAME: str = "Keystone Ad Ops"
    API_V1_STR: str = "/api/v1"
    # Allow all CORS for dev
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "*"]
    
    # Funny name as requested, located in project root for visibility
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'keystone_banana.db')}"
    
    # HubSpot
    HUBSPOT_ACCOUNT_ID: str = "179140854579"
    
    # Meta API
    META_ACCESS_TOKEN: str = os.getenv("META_ACCESS_TOKEN", "")
    AD_ACCOUNT_ID: str = os.getenv("AD_ACCOUNT_ID", "act_162214292")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore" # Allow extra fields in env

    def __init__(self, **data):
        super().__init__(**data)
        # FORCE override to use local DB, ignoring .env
        self.DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'keystone_banana.db')}"

settings = Settings()
