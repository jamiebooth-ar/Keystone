import requests
import re
from datetime import datetime
from typing import List, Dict, Optional, Any

class EventService:
    def __init__(self):
        self.url = "https://findamasters.com/_HeadOfficeScripts/n8nHandler.ashx?a=S1Pv28UyKt4dqOQhsTyD9gs7hUT6IFwUUzlmsP460JxoVlzEBtqtjCL1iWCL6WBS&type=1"
        self.headers = {
            "User-Agent": "n8n-FAU-Agentv1.1"
        }

    def _parse_asp_date(self, date_str: str) -> str:
        """Parse ASP.NET JSON date format /Date(1234567890)/"""
        if not date_str:
            return ""
        try:
            # Extract timestamp
            match = re.search(r'Date\((\d+)\)', date_str)
            if match:
                timestamp = int(match.group(1)) / 1000
                return datetime.fromtimestamp(timestamp).strftime("%d %b %Y")
        except Exception as e:
            print(f"Error parsing date {date_str}: {e}")
        return date_str

    def _clean_platform(self, medium: str) -> str:
        """Clean platform name from Medium field"""
        if not medium:
            return "Unknown"
        m_lower = medium.lower()
        if "meta" in m_lower or "facebook" in m_lower or "instagram" in m_lower:
            return "Meta"
        if "tiktok" in m_lower:
            return "TikTok"
        if "youtube" in m_lower:
            return "YouTube"
        if "linkedin" in m_lower:
            return "LinkedIn"
        return medium

    def fetch_events(self) -> List[Dict[str, Any]]:
        """Fetch and transform events"""
        try:
            # Disable SSL verify to avoid local cert issues
            response = requests.get(self.url, headers=self.headers, timeout=15, verify=False)
            response.raise_for_status()
            data = response.json()
            
            events = []
            for item in data:
                events.append({
                    "id": item.get("TagID"),
                    "product": item.get("ProductGroup"),
                    "venue": item.get("ProductName"),
                    "audience": item.get("TargetAudience"),
                    "brand": item.get("TrafficSource"), # FAM/FAP
                    "platform": self._clean_platform(item.get("Medium")),
                    "signups": item.get("SignupCount", 0),
                    "date": self._parse_asp_date(item.get("LiveDate"))
                })
            return events
        except Exception as e:
            print(f"Error fetching events: {e}")
            return []

event_service = EventService()
