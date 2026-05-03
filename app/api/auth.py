from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.user import User 
from app.models.company import Company
from app.schemas.auth import TokenResponse, RegisterCompanyRequest,LoginRequest,RegisterEmployeeRequest
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.schemas.user import UserResponse
from sqlalchemy.exc import IntegrityError

router =APIRouter(prefix="/auth" , tags=["auth"])

## craeting the company and the admin at the same time cz the admin is the one who creates the company account 

@router.post("/register-company", response_model= TokenResponse)
def register_comapny(data : RegisterCompanyRequest, db : Session = Depends(get_db)): 
     ## we check the existance of the email 
     email_exists = db.query(User).filter(User.email == data.email).first()
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
      ### fulsh() so we have the company id before we commit 

     try:
        db.flush()
     except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

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

     token = create_access_token({ 
        "sub" : str(admin_user.id), 
        "company_id" : admin_user.company_id,
        "role" : admin_user.role
        }
     )  
     return TokenResponse(
          
        access_token = token,
        company_id= admin_user.company_id,
        role = admin_user.role,
        name = admin_user.name

     ) ## here the admin after the registration will automatically be logged in


### nrml login process this login process is for the admin and the users added later by the admin so it a public login process 

@router.post("/Login", response_model= TokenResponse)
def Login(data: LoginRequest , db : Session =Depends(get_db)) : 
     
     ### check the user existance 
     user = db.query(User).filter(User.email == data.email).first()
    ## verifying the password 
     password_correctness = verify_password(data.password , user.password_hash)
      
     if not user or not password_correctness : 
        raise HTTPException(status_code=401 , detail="invalid credentials")

     token = create_access_token({
     "sub" : str(user.id),
     "company_id" : user.company_id,
     "role" : user.role

     })
     return TokenResponse(
          access_token = token,
          company_id = user.company_id,
          role=user.role,
          name=user.name
     )

## process of the admin creating the users 
@router.post("/register-employee", response_model=UserResponse) 
def register_employee(
     data : RegisterEmployeeRequest , 
     db : Session = Depends(get_db),
     current_user : User = Depends(get_current_user) ## bcz we want the admin which is the current user to create the employee
): 
     ## deque only the admin can create the employee we need to check wether the current user is the admin 

    if current_user.role != "admin" : 
         raise HTTPException(status_code=403 , detail="only admins can create employees")
    
    ## see if the email deja exists 

    user_existance = db.query(User).filter(
         User.email == data.email,
         User.company_id == current_user.company_id
    ).first()
    if user_existance : 
         raise HTTPException(status_code=404 , detail="this user already exists")
    
    new_user = User(
         company_id = current_user.company_id,
         name = data.name,
         email = data.email,
         password_hash =hash_password(data.password),
         role = data.role,
         is_active = True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

## now we want to get the current user informations 
@router.get("/me")
def get_me(
     current_user : User =Depends(get_current_user)
) : 
     return {
         "id" : current_user.id,
         "name": current_user.name,
         "email":current_user.email,
         "role":current_user.role,
         "company_id": current_user.company_id,
         "is_active" : current_user.is_active        
     }