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
    email_status : str 
    email_error : str | None = None  
    status : str 
    payment_status : str
    payment_link : str | None = None

    class Config : 
        from_attributes = True 