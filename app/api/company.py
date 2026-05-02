from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session 
from app.core.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyResponse
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import List
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("/companies", response_model= CompanyResponse)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    existing = db.query(company).filter(Company.email == company.email).first()
    if existing : 
        raise HTTPException(status_code=400, detail = "email already used")
    new_company = Company(
        name=company.name,
        industry=company.industry,
        email=company.email,
        status="active"
    )

    try:
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already exists")

    return new_company

@router.get("/", response_model=List[CompanyResponse]) 
def get_companies (db : Session = Depends(get_db)): 
    companies = db.query(Company).all()
    return companies

@router.get("/me", response_model=CompanyResponse)
def get_my_company(
    current_user : User = Depends(get_current_user),
    db : Session = Depends(get_db)
) : 
    company_existence = db.query(Company).filter(
         Company.id == current_user.company_id 
    ).first()
    
    if not company_existence : 
        raise HTTPException (status_code=404 , detail="company not found")
    return company_existence