from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db
from typing import List
from sqlalchemy.orm import Session
from app.schemas.store import CreateStore, StoreResponse
from app.models.company import Company
from app.models.Store import Store
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/stores", tags=['Stores'] )

@router.post("/", response_model=StoreResponse)
def create_store(store : CreateStore, db : Session = Depends(get_db), current_user : User = Depends(get_current_user)): 

    ## we see if the company exists 

    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company : 
        raise HTTPException(status_code= 404 , detail="company does not exist !!")
    
    new_store = Store(
        name = store.name,
        location = store.location,
        company_id = current_user
    )
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return new_store 

@router.get("/" , response_model=List[StoreResponse])
def get_stores(db : Session = Depends(get_db), current_user : User = Depends(get_current_user)):
    return  db.query(Store).filter(Store.company_id == current_user.company_id).all()
