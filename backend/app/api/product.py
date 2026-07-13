from app.core.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.company import Company
from app.models.product import Product
from app.schemas.product import ProductCreate , ProductResponse
from app.models.user import User
from app.core.deps import get_current_user, company_id_from_api_key

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/" , response_model=ProductResponse)

def create_product(product :ProductCreate, db : Session = Depends(get_db), current_user : User = Depends(get_current_user)) : 

    #### we need to see if the company exists 

    company = db.query(Company).filter(Company.id == current_user.company_id).first()

    if not company : 
        raise HTTPException(status_code=404, detail="Company not found")
    
    #### see if Stock Keeping Unit IS NOT already used by the company 

    sku_exist = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.sku == product.sku
    ).first()
    if sku_exist :
        raise HTTPException(status_code=400 , detail="sku already exists for this comapny!!")
    
    new_product = Product(
        name=product.name,
        sku = product.sku,
        price = product.price,
        description = product.description,
        attributes = [a.model_dump() for a in product.attributes] if product.attributes else None,
        company_id = current_user.company_id
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/", response_model=List[ProductResponse])
def get_product(db : Session = Depends(get_db), current_user : User = Depends(get_current_user)):
    return db.query(Product).filter(Product.company_id == current_user.company_id).all()


########## PUBLIC (no auth) — for the ChatGPT/MCP customer tools ##########

## "do you sell X?" -> search products by name OR sku
@router.get("/public/search", response_model=List[ProductResponse])
def public_search_products(
    query : str | None = Query(default=None),
    company_name : str | None = Query(default=None),
    scoped_company_id : int | None = Depends(company_id_from_api_key),
    db : Session = Depends(get_db),
):
    q = db.query(Product)

    if scoped_company_id is not None:  ## X-API-Key present -> scope to that brand only
        q = q.filter(Product.company_id == scoped_company_id)
    elif company_name :
        q = q.join(Company, Product.company_id == Company.id)
        q = q.filter(Company.name.ilike(f"%{company_name}%"))

    if query :
        q = q.filter(or_(
            Product.name.ilike(f"%{query}%"),
            Product.sku.ilike(f"%{query}%"),
        ))

    return q.all()


## details of a single product (price, description ...)
@router.get("/public/{product_id}", response_model=ProductResponse)
def public_get_product(
    product_id : int,
    scoped_company_id : int | None = Depends(company_id_from_api_key),
    db : Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product :
        raise HTTPException(status_code=404, detail="product does not exist !!")
    ## with a brand key, a product from another brand is treated as not found
    if scoped_company_id is not None and product.company_id != scoped_company_id:
        raise HTTPException(status_code=404, detail="product does not exist !!")
    return product

