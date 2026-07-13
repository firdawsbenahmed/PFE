from fastapi import FastAPI
from backend.app.core.database import engine
from backend.app.api.company import router as company_router
from backend.app.api.product import router as product_router
from backend.app.api.store import router as store_router
from backend.app.api.inventory import router as inventory_router
from backend.app.api.auth import router as auth_router
from backend.app.api.flight import router as flight_router
from backend.app.api.booking import router as booking_router
from backend.app.api.admin import router as admin_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(flight_router)
app.include_router(booking_router)
app.include_router(admin_router)
app.include_router(company_router)
app.include_router(product_router)
app.include_router(store_router)
app.include_router(inventory_router)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)