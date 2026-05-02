from app.core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from typing import List 
from sqlalchemy.orm import Session 
from app.models.company import Company 
from app.models.product import Product 
from app.schemas.product import ProductCreate , ProductResponse
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/" , response_model=ProductResponse)

def create_product(product :ProductCreate, db : Session = Depends(get_db)) : 

    #### we need to see if the company exists 

    company = db.query(Company).filter(Company.id == product.company_id).first()

    if not company : 
        raise HTTPException(status_code=404, detail="Company not found")
    
    #### see if Stock Keeping Unit IS NOT already used by the company 

    sku_exist = db.query(Product).filter(
        Product.company_id == product.company_id,
        Product.sku == product.sku
    ).first()
    if sku_exist :
        raise HTTPException(status_code=400 , detail="sku already exists for this comapny!!")
    
    new_product = Product(
        name=product.name,
        sku = product.sku,
        price = product.price,
        description = product.description,
        company_id = product.company_id
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/", response_model=List[ProductResponse]) 
def get_product(db : Session = Depends(get_db), current_user : User = Depends(get_current_user)): 
    return db.query(Product).filter(Product.company_id == current_user.company_id).all()

