from fastapi import FastAPI
from app.core.database import engine
from app.api.company import router as company_router
from app.api.product import router as product_router
from app.api.store import router as store_router
from app.api.inventory import router as inventory_router
from app.api.auth import router as auth_router 
from app.api.flight import router as flight_router
from app.api.booking import router as booking_router

app = FastAPI()

app.include_router(booking_router)