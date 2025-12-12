from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/")
def root():
    return {"message": "Welcome to Keystone Ad Ops API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/deals")
def get_hubspot_deals(page: int = 1, limit: int = 50, status: str = "all"):
    """Query deals from database"""
    from app.core.database import SessionLocal
    from app.models import Deal
    from sqlalchemy import desc
    
    db = SessionLocal()
    
    try:
        # Just query from database
        query = db.query(Deal).order_by(desc(Deal.createdate))
        
        # Apply status filter
        if status == "paid":
            query = query.filter(Deal.dealstage == "closedwon")
        elif status == "pending":
            query = query.filter(Deal.dealstage != "closedwon", Deal.dealstage != "closedlost")
        elif status == "overdue":
            query = query.filter(Deal.dealstage == "closedlost")
        
        # Get total and paginate
        total = query.count()
        total_pages = (total + limit - 1) // limit if total > 0 else 1
        offset = (page - 1) * limit
        deals = query.offset(offset).limit(limit).all()
        
        # Format results
        results = []
        for deal in deals:
            results.append({
                "id": deal.id,
                "properties": {
                    "dealname": deal.dealname or "",
                    "amount": str(deal.amount) if deal.amount else "0",
                    "dealstage": deal.dealstage or "",
                    "createdate": deal.createdate.isoformat() if deal.createdate else None,
                    "closedate": deal.closedate.isoformat() if deal.closedate else None,
                    "pipeline": deal.pipeline or ""
                }
            })
        
        return {
            "results": results,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": total_pages
            }
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"results": [], "error": str(e), "pagination": {"page": 1, "limit": 50, "total": 0, "pages": 1}}
    finally:
        db.close()


from app.api.v1.router import api_router

app.include_router(api_router, prefix="/api/v1")
