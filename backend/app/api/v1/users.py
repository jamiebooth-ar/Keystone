from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import user as user_schema
from app.models import user as user_model

router = APIRouter()

@router.get("/", response_model=List[user_schema.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve users.
    """
    users = db.query(user_model.User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=user_schema.User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: user_schema.UserCreate
) -> Any:
    """
    Create new user.
    """
    user = db.query(user_model.User).filter(user_model.User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="The user with this email already exists in the system.")
    
    # Needs password hashing logic here from core.security
    # For now, storing fake hashed
    fake_hashed_password = user_in.password + "notreallyhashed"
    
    user = user_model.User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=fake_hashed_password,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        # Default others
        role_id=1,
        department_id=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
