from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterCompanyRequest(BaseModel): 
    company_name : str 
    industry : Optional[str] = None

    admin_name : str
    email : EmailStr
    password : str 

class RegisterEmployeeRequest(BaseModel): 
    name : str
    email : EmailStr
    password : str 
    role : str = "employee"

class LoginRequest(BaseModel): 
    email: EmailStr 
    password : str 

class TokenResponse(BaseModel): 
    access_token: str
    token_type: str="bearer"
    company_id: int
    role : str
    name : str

class VerifyEmailRequest(BaseModel) : 
    token : str 

class ResendVerificationRequest(BaseModel): 
    email : EmailStr

class ChangePasswordRequest(BaseModel): 
    current_password : str 
    new_password : str
class ForgetPasswordRequest(BaseModel): 
    email : EmailStr
class ResetPasswordRequest(BaseModel) : 
    token : str 
    new_password : str 