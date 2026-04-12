from fastapi import FastAPI
from app.core.database import engine
from app.api.company import router as company_router
from app.api.product import router as product_router
app = FastAPI()

app.include_router(product_router)