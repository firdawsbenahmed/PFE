from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session 
from app.core.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyResponse
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import List

router = APIRouter()


@router.post("/companies", response_model= CompanyResponse)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
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

