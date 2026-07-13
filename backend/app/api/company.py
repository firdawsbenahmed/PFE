import secrets
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.company import Company
from app.schemas.company import  CompanyResponse,CompanyUpdate
from fastapi import HTTPException
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["companies"])


def _new_api_key() -> str:
    return "uf_" + secrets.token_urlsafe(24)

    
@router.get("/me", response_model=CompanyResponse)
def get_my_company(
    db: Session = Depends(get_db),
    current_user : User = Depends (get_current_user)
) : 
    company = db.query(Company).filter(
        Company.id == current_user.company_id
    ).first()
    if not company : 
        raise HTTPException(status_code=404 , detail= "company does not exist ")
    return company
 
## updating the company data 

@router.put("/me", response_model=CompanyResponse)
def Update_company(
    data : CompanyUpdate,
    db:Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    ## mind u only the admins can do the updates 
    if current_user.role != "admin" : 
        raise HTTPException(status_code=403 , detail="only Admins can do the updates")
    
    ## see if the company exists 

    company = db.query(Company).filter(
        Company.id == current_user.company_id
    ).first()
    if not company : 
        raise HTTPException(status_code= 404 , detail="company not found")
    
    if data.name is not None : 
        company.name = data.name
    if data.industry is not None :
        company.industry = data.industry
    if data.email is not  None : 
        company.email = data.email

    db.commit()
    db.refresh(company)

    return company


## the brand's MCP / AI-app key. The admin pastes this into their MCP server
## (COMPANY_API_KEY) so the AI tools only ever see THIS company's data.
@router.get("/me/api-key")
def get_my_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="only Admins can view the API key")
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="company not found")
    if not company.api_key:  ## lazily mint one for older companies
        company.api_key = _new_api_key()
        db.commit()
        db.refresh(company)
    return {"company": company.name, "api_key": company.api_key}


## rotate (invalidate the old key, issue a new one)
@router.post("/me/api-key/rotate")
def rotate_my_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="only Admins can rotate the API key")
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="company not found")
    company.api_key = _new_api_key()
    db.commit()
    db.refresh(company)
    return {"company": company.name, "api_key": company.api_key}
