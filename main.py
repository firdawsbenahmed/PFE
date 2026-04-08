from fastapi import FastAPI
from app.core.database import engine
from app.api.company import router as company_router

app = FastAPI()

app.include_router(company_router)