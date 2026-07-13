from pydantic import BaseModel
from typing import Optional


class CreateStore(BaseModel):
    name : str
    location : str
    manager_id : Optional[int] = None   ## responsible employee (optional)
    ##company_id : int ## removed it cz it will be provided by the token


class UpdateStore(BaseModel):
    ## all optional -> partial update
    name : Optional[str] = None
    location : Optional[str] = None
    manager_id : Optional[int] = None


class StoreResponse(BaseModel):
    id : int
    name : str
    location : str
    company_id : int
    manager_id : Optional[int] = None
    manager_name : Optional[str] = None   ## enriched from the users table

    class Config:
        from_attributes = True
