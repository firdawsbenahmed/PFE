from app.schemas.user import UserCreate, UserResponse,LoginUser
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.user import User 
from app.models.company import Company
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token,get_current_user

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
@router.post("/LogIn") 
def Login(user : LoginUser , db : Session = Depends(get_db)): 

    user_exist = db.query(User).filter(User.email == user.email).first()

    if not user_exist or not verify_password(user.password, user_exist.password_hash) : 
        raise HTTPException(status_code=401 , detail="Invalid credentials")

    if not user_exist.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    
    access_token =  create_access_token (
        data ={"sub": str(user_exist.id), "company_id": user_exist.company_id}
    )
    return {
        "access_token" : access_token,
        "token_type": "bearer" ,## i used this cz it is a standard way to send tokens in HTTP
        "company_id": user_exist.company_id,
        "role" : user_exist.role
    }
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "company_id": current_user.company_id,
        "name": current_user.name,
        "role": current_user.role
    }