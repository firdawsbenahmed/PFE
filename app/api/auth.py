from app.schemas.user import UserCreate, UserResponse,LoginUser
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.user import User 
from app.models.company import Company
from typing import List 
from app.core.database import get_db
from app.core.security import hash_password, verify_password

router =APIRouter(prefix="/auth" , tags=["auth"])

@router.post("/", response_model=UserResponse)
def Create_user(user : UserCreate , db: Session = Depends(get_db)) : 

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user: 
        raise HTTPException(status_code=404, detail="email already exists")

    company_existing = db.query(Company).filter(Company.id == user.company_id).first()

    if not company_existing : 
        raise HTTPException(status_code=404, detail="company does not exists !!")
    

    hashed_password = hash_password(user.password)

    new_user = User(
        company_id = user.company_id,
        name = user.name,
        password_hash = hashed_password,
        email = user.email,
        role = user.role
    )    

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
    
