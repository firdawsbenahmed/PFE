from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.user import User 
from app.models.company import Company
from app.models.email_verification import EmailVerificationToken
from app.schemas.auth import TokenResponse, RegisterCompanyRequest,LoginRequest,RegisterEmployeeRequest, ResendVerificationRequest, ResetPasswordRequest, VerifyEmailRequest, ChangePasswordRequest, ForgetPasswordRequest
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.schemas.user import UserResponse
from sqlalchemy.exc import IntegrityError
from app.core.email import send_verification_email, password_resert_email
import secrets
from datetime import datetime , timedelta , timezone
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
          is_active = True , 
          is_verified = False 

     )     
     db.add(admin_user)
     db.commit()
     db.refresh(admin_user)
     ### hna ndirou email verification 
     token_value = secrets.token_urlsafe(32)
     verification_token = EmailVerificationToken(
         user_id = admin_user.id,
         token = token_value,
         expires_at = datetime.now(timezone.utc) + timedelta(hours=24),
         used = False
     )
     db.add(verification_token)
     db.commit()
     
     result =  send_verification_email (admin_user.email , token_value)
     if not result["success"] : 
          print(f"[WARNING] Verification rmsil failed")

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

@router.post("/Login", response_model=TokenResponse)
def Login(data: LoginRequest, db: Session = Depends(get_db)):

    # check user existence
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="invalid credentials"
        )

    # verify password
    password_correctness = verify_password(
        data.password,
        user.password_hash
    )

    if not password_correctness:
        raise HTTPException(
            status_code=401,
            detail="invalid credentials"
        )
    if not user.is_verified:
           raise HTTPException(status_code=403, detail="Please verify your email first")

    token = create_access_token({
        "sub": str(user.id),
        "company_id": user.company_id,
        "role": user.role
    })

    return TokenResponse(
        access_token=token,
        company_id=user.company_id,
        role=user.role,
        name=user.name
    )

########### email verification ######################
@router.get("/verify-email")
def verification_email(
     token : str , 
     db : Session = Depends(get_db)
) : 
     """
     called when user clicks the link in thier email.
     The token is passed as a query param : /auth/verify-email?token=abc123
     """
     record = db.query(EmailVerificationToken).filter(
          EmailVerificationToken.token == token
     ).first()

     if not record : 
          raise HTTPException(status_code=400 , detail="invalid verification token ")
     if record.used : 
          raise HTTPException(status_code=400 , detail="this token is already used")
     if record.expires_at < datetime.now(timezone.utc) : 
          raise HTTPException(status_code=  400 , detail="token has expired , please request a new one ")
     
     record.used = True

     ### we need to verify the user 
     user = db.query(User).filter(User.id == record.user_id).first()
     if not user : 
          raise HTTPException(status_code=404 , detail="the user not found")
     
     user.is_verified = True
     db.commit()

     return{"message" : "email has been successfuly verified"}

################  resend the email ########## 
@router.post("/resend-verification")
def resend_verification(
     data:ResendVerificationRequest , 
     db : Session = Depends(get_db)
):
     user = db.query(User).filter(
          User.email == data.email
     ).first()
     if not user or not user.is_verified:
          return{"message" : "if this email exist and unverified , a new link has been sent"}
    # Invalidate any existing unused tokens
     db.query(EmailVerificationToken).filter(
          EmailVerificationToken.user_id == user.id,
          EmailVerificationToken.used == False
     ).update({"used" : True})
     db.commit()

     token_value = secrets.token_urlsafe(32)
     new_token = EmailVerificationToken(
         user_id = user.id,
         token = token_value,
         expires_at = datetime.now(timezone.utc) + timedelta(hours=24),
         used = False
     )
     db.add(new_token)
     db.commit()
     
     send_verification_email(user.email , token_value)
     return{"message":"if this email exist and unverified , a new link will be sent"}

## user is loggedIn 
@router.put("/change-password")
def change_password(
     data : ChangePasswordRequest,
     db : Session = Depends(get_db),
     current_user : User = Depends(get_current_user)
) : 
     if not verify_password(data.current_password , current_user.password_hash) : 
          raise HTTPException(status_code=401 , detail="the current password is uncorrect")
     if data.current_password == data.new_password : 
          raise HTTPException(status_code=400 , detail= "the new password should not match the current password ")
     
     current_user.password_hash = hash_password(data.new_password)
     db.commit()

     return {"message" : "password updated"} 

########### forget the passwrd
@router.post("/forget-password")
def forget_password(
     data : ForgetPasswordRequest ,
     db : Session = Depends(get_db),
) : 
     user = db.query(User).filter(
          User.email == data.email
     ).first()

     if not user : 
          return{"message" : "if this email exists a reset link has been sent"} 
     ## we dont need to tell the user whether this email exists or not 

     token_value = secrets.token_urlsafe(32)
     reset_token = EmailVerificationToken(
         user_id = user.id,
         token = token_value,
         expires_at = datetime.now(timezone.utc) + timedelta(hours=1),
         used = False
     )
     db.add(reset_token)
     db.commit()

     password_resert_email(user.email , token_value)

     return{"message":"if this email exists a reset link has been sent"}

############## reset the password 
@router.post("/reset-password")
def reset_password(
     data : ResetPasswordRequest,

     db: Session = Depends(get_db) , 
) : 
     record = db.query(EmailVerificationToken).filter(
          EmailVerificationToken.token == data.token
     ).first()
     if not record : 
          raise HTTPException(status_code=400 , detail="invalid reset token")
     
     if record.used : 
          raise HTTPException(status_code=400 , detail="this reset link is already used")

     if record.expires_at < datetime.now(timezone.utc) : 
          raise HTTPException(status_code=  400 , detail="token has expired , please request a new one ")
     
     user = db.query(User).filter(
          User.id == record.user_id
     ).first()
     if not user : 
          raise HTTPException(status_code=404 , detail="user not found")
     
     user.password_hash = hash_password(data.new_password)
     db.commit()
     record.used = True
     db.commit()
     return {"message": "Password reset successfully. You can now log in with your new password."}



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
         is_verified = True,
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
         "is_active" : current_user.is_active,  
         "is_verified" : current_user.is_verified   
     }