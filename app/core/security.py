from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime , timedelta, timezone
from fastapi import HTTPException,Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") 

ALGORITHM = "HS256" 
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes= ["bcrypt"], deprecated = "auto")


security = HTTPBearer()

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

def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session= Depends(get_db)) : 
    credential_exception = HTTPException(

        status_code=401, 
        detail="could not validate these credentials"
    )

    try : 
        token = credentials.credentials
        playload = jwt.decode(token, SECRET_KEY , algorithms=[ALGORITHM])

        email : str = playload.get("sub")

        if email is None : 
            raise credential_exception 
    except JWTError : 
        raise credential_exception 
    
    user = db.query(User).filter(User.email == email).first()

    if user is None : 
        raise credential_exception 
    
    return user 