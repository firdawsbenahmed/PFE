from pydantic import BaseModel

class CompanyCreate(BaseModel): 
    name: str
    industry : str
    email : str
