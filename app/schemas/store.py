from pydantic import BaseModel 

class CreateStore(BaseModel):
    name : str 
    location : str 
    company_id : int 

class StoreResponse(BaseModel): 
    name : str 
    location : str 
    company_id : int 
    id : int

    class Config:
        from_attributes = True   
