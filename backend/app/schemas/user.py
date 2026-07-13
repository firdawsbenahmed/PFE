from pydantic import BaseModel , EmailStr


class UserResponse(BaseModel): 
    id : int
    company_id : int
    name : str 
    email: EmailStr
    role : str 
    is_active : bool 

    class Config: 
        from_attributes =  True