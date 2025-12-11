from typing import List, Dict
from app.services.meta_service import meta_service

class PredictionService:
    def calculate_predictions(
        self, 
        campaign_type: str, 
        countries: List[str], 
        allocations: Dict[str, float], 
        duration_months: int
    ) -> Dict:
        
        # 1. Determine Client Spend
        if campaign_type == "Brand":
            client_spend_base = 3000
        elif campaign_type == "LeadGen":
            client_spend_base = 3900
        else:
            client_spend_base = 3000 # Default
            
        total_client_spend = client_spend_base * duration_months
        
        # 2. Calculate Media Spend (25% of Client Spend)
        media_spend = total_client_spend * 0.25
        
        results = {
            "summary": {
                "client_spend": total_client_spend,
                "media_spend": media_spend,
                "duration_months": duration_months,
                "campaign_type": campaign_type
            },
            "breakdown": [],
            "totals": {
                "impressions": 0,
                "reach": 0,
                "link_clicks": 0,
                "leads": 0
            }
        }
        
        for country in countries:
            stats = meta_service.get_aggregated_stats(campaign_type, country)
            
            # Budget for this country
            alloc = allocations.get(country, 0)
            country_budget = media_spend * (alloc / 100.0)
            
            # Metrics
            cpm = stats["CPM"]
            cpc = stats["CPC"]
            cpl = stats["CPL"]
            freq = stats["Frequency"]
            
            # Formulas
            impressions = (country_budget / cpm) * 1000 if cpm > 0 else 0
            reach = impressions / freq if freq > 0 else 0
            
            link_clicks = 0
            leads = 0
            
            if campaign_type == "Brand":
                link_clicks = country_budget / cpc if cpc > 0 else 0
            elif campaign_type == "LeadGen":
                leads = country_budget / cpl if cpl > 0 else 0
                link_clicks = country_budget / cpc if cpc > 0 else 0 # Estimate clicks too
                
            # Add to results
            country_res = {
                "country": country,
                "budget": round(country_budget, 2),
                "impressions": int(impressions),
                "reach": int(reach),
                "link_clicks": int(link_clicks),
                "leads": int(leads),
                "cpm": round(cpm, 2),
                "cpc": round(cpc, 2),
                "cpl": round(cpl, 2),
                "frequency": round(freq, 2)
            }
            results["breakdown"].append(country_res)
            
            # Totals
            results["totals"]["impressions"] += int(impressions)
            results["totals"]["reach"] += int(reach)
            results["totals"]["link_clicks"] += int(link_clicks)
            results["totals"]["leads"] += int(leads)
            
        return results

prediction_service = PredictionService()
