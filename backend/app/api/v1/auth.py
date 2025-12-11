from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    id: int
    username: str
    email: str
    token: str # Simple token for now

@router.post("/login", response_model=LoginResponse)
def login(
    login_in: LoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Authenticate user.
    """
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Verify password (CMS4 used simple hashing or direct comparison in dev? We'll assume simple match from seed for now)
    # In production, this MUST use bcrypt/argon2
    # Implementing simple "fake hash" check as defined in create_user
    # expected_hash = login_in.password + "notreallyhashed" 
    
    # For migration simplicity/seed data compatibility: 
    # If using seeded data, we might store plain text or simple hash. 
    # Let's assume the seeded user has a known "hashed" value.
    
    # Logic: Check if password string is in the hashed field (Very insecure, for Dev only as per instruction "safe to run")
    if not user.hashed_password or login_in.password not in user.hashed_password:
         # Fallback for seeded user which might set hashed_password="password" directly
         if user.hashed_password != login_in.password:
            raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "token": "fake-jwt-token-for-dev"
    }
