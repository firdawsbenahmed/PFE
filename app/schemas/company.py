from pydantic import BaseModel, EmailStr

class CompanyCreate(BaseModel): 
    name: str
    industry : str
    email : EmailStr
class CompanyResponse( BaseModel) : 
    id : int 
    name : str 
    email : str 
    industry : str

    class config: 
        from_attributes = True
