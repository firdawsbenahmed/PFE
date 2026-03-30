from fastapi import APIRouter, Depends
from sqlalchemy.orm import session 
from app.core.database import SessionLocal
from app.models.company import Company
from app.schemas.company import CompanyCreate

route = APIRouter()


def get_db():
    db = SessionLocal()

    try : 
        yield db
    finally: 
        db.close()


