from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.schemas import analytics as analytics_schema
from app.models import analytics as analytics_model
from datetime import datetime

router = APIRouter()

@router.get("/benchmarks/sitewide", response_model=List[analytics_schema.BenchmarkAgg])
def get_sitewide_benchmarks(
    collection_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get aggregated sitewide benchmarks grouped by month.
    """
    results = db.query(
        analytics_model.BenchmarkStats.month,
        analytics_model.BenchmarkStats.collection_id,
        func.sum(analytics_model.BenchmarkStats.stat_total).label("total_stats"),
        func.sum(analytics_model.BenchmarkStats.prog_total).label("total_prog")
    ).filter(
        analytics_model.BenchmarkStats.collection_id == collection_id
    ).group_by(
        analytics_model.BenchmarkStats.month,
        analytics_model.BenchmarkStats.collection_id
    ).all()
    
    # Calculate aggregate manually as per legacy service logic
    output = []
    for row in results:
        month, col_id, stat_total, prog_total = row
        agg = 0.0
        if prog_total and prog_total > 0:
            agg = round(stat_total / prog_total, 2)
            
        output.append({
            "month": month,
            "collection_id": col_id,
            "stat_total": stat_total,
            "aggregate": agg
        })
        
    return output
