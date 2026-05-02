# test_jwt.py
from app.core.security import create_access_token

token = create_access_token({"sub": "admin@nike.dz"})
print(token)