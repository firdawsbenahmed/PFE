from pydantic import BaseModel, Field   

class CreateInventory(BaseModel):
    ##company_id : int it will be given by the JWT token :)
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


## flat, human-readable shape for the public availability tool
class ProductAvailability(BaseModel):
    product_id : int
    product_name : str
    sku : str
    price : float
    store_id : int
    store_name : str
    store_location : str
    quantity : int
