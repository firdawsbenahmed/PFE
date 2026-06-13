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

app.include_router(auth_router)
app.include_router(auth_router)
app.include_router(flight_router)
app.include_router(booking_router)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)