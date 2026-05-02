from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel) :

    name : str
    sku : str 
    price : float
    ##company_id : int i have removed it cz it will be provided by the token 
    description : Optional[str] = None

class ProductResponse(BaseModel) : 

    id : int 
    name : str 
    sku : str 
    price : float 
    description : Optional[str]
    company_id : int 
    
    class Config (): 
        from_attributes = True