from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import get_db
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas.store import CreateStore, UpdateStore, StoreResponse
from app.models.company import Company
from app.models.Store import Store
from app.models.inventory import Inventory
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/stores", tags=['Stores'] )


## build a StoreResponse with the manager's name resolved from the users table
def _serialize(store: Store, db: Session) -> StoreResponse:
    manager_name = None
    if store.manager_id:
        manager = db.query(User).filter(User.id == store.manager_id).first()
        manager_name = manager.name if manager else None
    return StoreResponse(
        id=store.id,
        name=store.name,
        location=store.location,
        company_id=store.company_id,
        manager_id=store.manager_id,
        manager_name=manager_name,
    )


## the given manager must be a user of the SAME company (multi-tenant safety)
def _validate_manager(manager_id: Optional[int], current_user: User, db: Session):
    if manager_id is None:
        return
    manager = db.query(User).filter(
        User.id == manager_id,
        User.company_id == current_user.company_id,
    ).first()
    if not manager:
        raise HTTPException(status_code=404, detail="manager does not exist or does not belong to this company !!")


@router.post("/", response_model=StoreResponse)
def create_store(store : CreateStore, db : Session = Depends(get_db), current_user : User = Depends(get_current_user)):

    ## we see if the company exists
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company :
        raise HTTPException(status_code= 404 , detail="company does not exist !!")

    _validate_manager(store.manager_id, current_user, db)

    new_store = Store(
        name = store.name,
        location = store.location,
        company_id = current_user.company_id,
        manager_id = store.manager_id,
    )
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return _serialize(new_store, db)


@router.get("/" , response_model=List[StoreResponse])
def get_stores(db : Session = Depends(get_db), current_user : User = Depends(get_current_user)):
    stores = db.query(Store).filter(Store.company_id == current_user.company_id).all()
    return [_serialize(s, db) for s in stores]


@router.put("/{store_id}", response_model=StoreResponse)
def update_store(
    store_id : int,
    payload : UpdateStore,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user),
):
    store = db.query(Store).filter(
        Store.id == store_id,
        Store.company_id == current_user.company_id,   ## tenant check
    ).first()
    if not store :
        raise HTTPException(status_code=404, detail="store not found")

    if payload.name is not None:
        store.name = payload.name
    if payload.location is not None:
        store.location = payload.location
    ## only touch manager_id when the client actually sends it
    ## (sending it as null explicitly UN-assigns the manager)
    if "manager_id" in payload.model_fields_set:
        _validate_manager(payload.manager_id, current_user, db)
        store.manager_id = payload.manager_id

    db.commit()
    db.refresh(store)
    return _serialize(store, db)


@router.delete("/{store_id}")
def delete_store(
    store_id : int,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user),
):
    store = db.query(Store).filter(
        Store.id == store_id,
        Store.company_id == current_user.company_id,
    ).first()
    if not store :
        raise HTTPException(status_code=404, detail="store not found")

    ## clear the store's inventory first to respect FK constraints
    db.query(Inventory).filter(Inventory.store_id == store_id).delete()
    db.delete(store)
    db.commit()
    return {"message": "store deleted successfully !!"}


########## PUBLIC (no auth) — "where are your shops?" ##########
@router.get("/public/search", response_model=List[StoreResponse])
def public_search_stores(
    location : str | None = Query(default=None),
    company_name : str | None = Query(default=None),
    db : Session = Depends(get_db),
):
    q = db.query(Store)

    if company_name :
        q = q.join(Company, Store.company_id == Company.id)
        q = q.filter(Company.name.ilike(f"%{company_name}%"))

    if location :
        q = q.filter(Store.location.ilike(f"%{location}%"))

    return [_serialize(s, db) for s in q.all()]
