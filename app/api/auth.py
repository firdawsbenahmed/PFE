from app.schemas.user import UserCreate, UserResponse,LoginUser
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.user import User 
from app.models.company import Company
from app.schemas.auth import TokenResponse, RegisterCompanyRequest,LoginRequest,RegisterEmployeeRequest
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user

router =APIRouter(prefix="/auth" , tags=["auth"])

## craeting the company and the admin at the same time cz the admin is the one who creates the company account 

@router.post("/register-company", response_model= TokenResponse)
def register_comapny(data : RegisterCompanyRequest, db : Session = Depends(get_db)): 
     ## we check the existance of the email 
     email_exists = db.query(data).filter(User.email == data.email).first()
     if email_exists : 
          raise HTTPException(status_code=404, detail= "email already used")
     ## in case this email is not used then we create the company 
     new_company = Company(
          name = data.company_name,
          email = data.email,
          industry = data.industry,
          status = "active"
     )
     db.add(new_company)
     db.flush() ### fulsh() so we have the company id before we commit 

     admin_user = User(
          name = data.admin_name,
          email = data.email,
          password_hash = hash_password(data.password),
          company_id = new_company.id,
          role = "admin", 
          is_active = True

     )     
     db.add(admin_user)
     db.commit()
     db.refresh(admin_user)
