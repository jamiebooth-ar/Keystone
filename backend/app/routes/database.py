from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging

from app.services.database_agent import db_agent
from typing import Optional

router = APIRouter()
logger = logging.getLogger(__name__)

class DatabaseQuery(BaseModel):
    query: str

class DatabaseQueryResponse(BaseModel):
    results: List[Dict[str, Any]]
    query: str
    row_count: int
    answer: Optional[str] = None

@router.post("/query", response_model=DatabaseQueryResponse)
async def query_database(query_request: DatabaseQuery):
    """
    Query the FAU CMS and WYSIWYG databases based on natural language input.
    
    This endpoint will:
    1. Parse the natural language query
    2. Convert it to SQL
    3. Execute against CMS and/or WYSIWYG databases
    4. Return formatted results
    
    Database connections:
    - CMS: Data Source=134.213.185.96;Initial Catalog=fau-cms;user=scireg_ourcms;password=izjQL93FpG;
    - WYSIWYG: Data Source=134.213.185.96;Initial Catalog=WYSIWYG;user=scireg_ourcms;password=izjQL93FpG;MultipleActiveResultSets=True;
    """
    try:
        query = query_request.query.strip()
        
        # Use the DB Agent to process the query
        result = db_agent.process_query(query)
        
        # Check for agent-level errors
        if "error" in result and not result.get("answer"):
             raise HTTPException(status_code=500, detail=result["error"])

        return DatabaseQueryResponse(
            results=result.get("results", []),
            query=query,
            row_count=len(result.get("results", [])),
            answer=result.get("answer")
        )
        
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
