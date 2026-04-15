from pydantic import BaseModel, Field   

class CreateInventory(BaseModel):
    company_id : int 
    product_id : int 
    store_id : int 
    quantity: int = Field(gt=0) 

class UpdateInventoryQuantity(BaseModel): 
    quantity: int = Field(ge=0)

class ResponseInventory(BaseModel): 
    id : int 
    company_id : int 
    product_id : int 
    store_id : int 
    quantity : int 
    
    class Config: 
       from_attributes= True
