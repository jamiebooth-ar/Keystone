from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import content as content_schema
from app.models import content as content_model
from datetime import datetime

router = APIRouter()

@router.get("/templates/", response_model=List[content_schema.PageTemplate])
def read_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    return db.query(content_model.PageTemplate).offset(skip).limit(limit).all()

@router.post("/templates/", response_model=content_schema.PageTemplate)
def create_template(
    *,
    db: Session = Depends(get_db),
    template_in: content_schema.PageTemplateCreate
) -> Any:
    template = content_model.PageTemplate(
        **template_in.model_dump(),
        created_on=datetime.utcnow(),
        modified_on=datetime.utcnow(),
        created_by=1 # Default admin
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template
