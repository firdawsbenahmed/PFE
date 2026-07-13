from pydantic import BaseModel
from typing import Optional, List


class ProductAttribute(BaseModel):
    ## e.g. {"name": "Color", "values": ["Red", "Blue"]}
    name: str
    values: List[str]


class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    ##company_id : int i have removed it cz it will be provided by the token
    description: Optional[str] = None
    attributes: Optional[List[ProductAttribute]] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    description: Optional[str]
    company_id: int
    attributes: Optional[List[ProductAttribute]] = None

    class Config:
        from_attributes = True
