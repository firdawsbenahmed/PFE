from passlib.context import CryptContext
from jose import jwt
from datetime import datetime , timedelta, timezone

SECRET_KEY = "change-this-secret-key-later"
ALGORITHM = "HS256" 
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes= ["bcrypt"], deprecated = "auto")

def hash_password (password : str) -> str : 
    return pwd_context.hash(password)

def verify_password(plain_password : str , hashed_password : str) -> bool :
    return pwd_context.verify(plain_password , hashed_password)


def create_access_token(data : dict) : 

    to_encode = data.copy() ## We copy the data so we don’t modify the original dictionary

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp" : expire})
    encoded_jwt=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM )

    return encoded_jwt