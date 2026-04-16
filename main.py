##from fastapi import FastAPI
##from app.core.database import engine
##from app.api.company import router as company_router
##from app.api.product import router as product_router
##from app.api.store import router as store_router
#from app.api.inventory import router as inventory_router
##app = FastAPI()

##app.include_router(inventory_router)

from app.core.security import hash_password, verify_password

hashed = hash_password("nike123")
print(hashed)

print(verify_password("nike123", hashed))   # True
print(verify_password("wrongpass", hashed)) # False