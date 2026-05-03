from pydantic import BaseModel, EmailStr
from typing import Optional

class CompanyResponse( BaseModel) : 
    id : int 
    name : str 
    email : str 
    industry : str
    status : str

    class Config: 
        from_attributes = True

class CompanyUpdate(BaseModel): 
    name : Optional[str] = None
    industry : Optional[str] = None
    email : Optional[EmailStr]

