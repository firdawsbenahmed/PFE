
from fastapi import HTTPException,Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from jose import jwt, JWTError

from fastapi.security import HTTPBearer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") 

ALGORITHM = "HS256" 
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()


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

        user_id : str = playload.get("sub")

        if user_id is None : 
            raise credential_exception 
    except JWTError : 
        raise credential_exception 
    
    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None : 
        raise credential_exception 
    
    return user 