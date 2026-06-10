### uvicorn main:app --reload
## alembic revision --autogenerate -m "add aviation tables"  
##sudo -u postgres psql -d pfe_backend_db

# test_jwt.py
from app.core.security import create_access_token

token = create_access_token({"sub": "admin@nike.dz"})
print(token)