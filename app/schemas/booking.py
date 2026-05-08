from pydantic import BaseModel , EmailStr

class BookinCreate(BaseModel) : 
    flight_id : int 
    flight_class_id : int 
    passenger_name : str 
    passenger_email : EmailStr 

class BookingResponse : 
    id : int 
    company_id : int 
    flight_id : int 
    flight_class_id : int 
    passenger_name : str 
    passenger_email : EmailStr    

    class Config : 
        from_attributes = True 