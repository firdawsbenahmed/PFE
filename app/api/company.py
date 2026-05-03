from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session 
from app.core.database import get_db
from app.models.company import Company
from app.schemas.company import  CompanyResponse
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import List
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/me", response_model=CompanyResponse)
def get_my_company(
    db: Session = Depends(get_db),
    current_user : User = Depends (get_current_user)
) : 
    company = db.query(Company).filter(
        Company.id == current_user.company_id
    ).first()
    if not company : 
        raise HTTPException(status_code=404 , detail= "company does not exist ")
    return company 

