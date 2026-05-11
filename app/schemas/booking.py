from pydantic import BaseModel , EmailStr
from datetime import datetime

class BookinCreate(BaseModel) : 
    flight_id : int 
    flight_class_id : int 
    passenger_name : str 
    passenger_email : EmailStr 

class BookingResponse (BaseModel): 
    id : int 
    company_id : int 
    flight_id : int 
    flight_class_id : int 
    passenger_name : str 
    passenger_email : EmailStr    
    status : str 

    class Config : 
        from_attributes = True 