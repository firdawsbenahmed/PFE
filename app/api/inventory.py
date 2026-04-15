from app.models.company import Company
from app.models.product import Product
from app.models.Store import Store
from app.models.inventory import Inventory
from app.schemas.inventory import CreateInventory, ResponseInventory, UpdateInventoryQuantity
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy.orm import Session 
from app.core.database import get_db


router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.post("/", response_model= ResponseInventory)
def create_inventory(item : CreateInventory, db : Session = Depends(get_db)) : 

    ### checking for the existance of the company 

    company = db.query(Company).filter(Company.id == item.company_id).first()

    if not company : 
        raise HTTPException (status_code=404 , detail="company does not exist !!")
    
    ## cheching if product exists 

    product_existing = db.query(Product).filter(
        Product.company_id == item.company_id,
        Product.id == item.product_id
    ).first()

    if not product_existing : 
        raise HTTPException(status_code=404 , detail="product does not exist !!")


    ## we check if the store exists  and if it belongs to this camp

    store_existing = db.query(Store).filter(
        Store.id == item.store_id,
        Store.company_id == item.company_id
    ).first()

    if not store_existing : 
        raise HTTPException(status_code=404 , detail="store does not exist or belong to this company !!")
    

    ## we check if the inventory already exists and add the new quantity to it 

    inventory_exist = db.query(Inventory).filter(
        Inventory.company_id == item.company_id,
        Inventory.store_id == item.store_id,
        Inventory.product_id == item.product_id
    ).first()
    if inventory_exist : 
        inventory_exist.quantity += item.quantity
        db.commit()
        db.refresh(inventory_exist)
        return inventory_exist 
    
    ## if it does not exist we create a new ofcrs 

    new_inventory = Inventory(
        company_id = item.company_id,
        product_id = item.product_id,
        store_id = item.store_id,
        quantity = item.quantity  
    )
    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory 

@router.get("/",response_model=List[ResponseInventory])
def get_inventory(
    comapny_id: int | None = Query(default = None),
    db : Session = Depends(get_db)) : 
    query = db.query(Inventory)

    if comapny_id is not None : 
        query = query.filter(Inventory.company_id == comapny_id)

    return query.all()

## since our project is multitenant we nee to use the inventory_id so each comapany only aceess its own data
@router.put("/{inventory_id}", response_model=ResponseInventory)
def update_inventory_quantity(
        inventory_id: int,
        payload: UpdateInventoryQuantity,
        db : Session = Depends(get_db)
):
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first() ## SELECT * FROM inventory WHERE company_id = 1;

    if not inventory : 
        raise HTTPException(status_code=404, detail="inventory record not found")
    
    inventory.quantity = payload.quantity ## we replaces the value of the inventory withh a new one 
    db.commit()
    db.refresh()
    return inventory

@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id : int,
    db : Session = Depends(get_db)
):
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()

    if not inventory : 
        raise HTTPException(status_code=404 , detail="inventory record is not found ")
    
    db.delete(inventory)
    db.refresh()

    return {"Inventory record has been deleted successfully !!"}



    
