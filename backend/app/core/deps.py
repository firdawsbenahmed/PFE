
from typing import Optional
from fastapi import HTTPException,Depends, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.company import Company
from jose import jwt, JWTError

from fastapi.security import HTTPBearer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") 

ALGORITHM = "HS256" 
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 700 

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
        plaload = jwt.decode(token, SECRET_KEY , algorithms=[ALGORITHM])

        user_id : str = plaload.get("sub")

        if user_id is None : 
            raise credential_exception 
    except JWTError : 
        raise credential_exception 
    
    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None :
        raise credential_exception

    return user


def company_id_from_api_key(
    x_api_key: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Optional[int]:
    """
    Resolve a company from the 'X-API-Key' header. Used by the MCP / customer-facing
    tools so an AI app is bound to ONE brand and can only read that brand's data.
    Returns None when no key is sent, so endpoints stay backward-compatible
    (they then fall back to the optional company_name filter).
    """
    if not x_api_key:
        return None
    company = db.query(Company).filter(Company.api_key == x_api_key).first()
    if not company:
        raise HTTPException(status_code=401, detail="invalid company API key")
    return company.id
