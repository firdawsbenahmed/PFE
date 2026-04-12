from pydantic import BaseModel

class CreateInventory(BaseModel):
    company_id : int 
    product_id : int 
    store_id : int 
    quantity : int 

class ResponseInventory(BaseModel): 
    id : int 
    company_id : int 
    product_id : int 
    store_id : int 
    quantity : int 
    
    class Config: 
       from_attributes= True
