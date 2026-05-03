from pydantic import BaseModel



class CompanyResponse( BaseModel) : 
    id : int 
    name : str 
    email : str 
    industry : str
    status : str

    class config: 
        from_attributes = True
