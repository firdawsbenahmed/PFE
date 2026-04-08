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

    class config:
        from_attributes = True   
