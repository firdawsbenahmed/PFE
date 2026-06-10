from pydantic import BaseModel , Field
from datetime import datetime
from typing import Literal, List, Optional

class FlightClassCreate(BaseModel): 
    class_type : Literal["economy","business","first"]
    price : int = Field(gt = 0)
    total_seats : int = Field(gt = 0) 

class FlightCreate(BaseModel): 
    flight_number : str 
    origin : str 
    destination : str 
    departure_time : datetime
    arrival_time : datetime 
    classes : List[FlightClassCreate] = Field(min_length=1 , max_length=3)

class FlightClassResponse(BaseModel): 
    id : int
    flight_id : int 
    class_type : str = Field(alias="flight_class")
    price : int 
    total_seats : int 
    available_seats : int 
    
    class Config : 
        from_attributes = True 
        populate_by_name = True

class FlightResponse(BaseModel): 
    id : int 
    company_id : int 
    flight_number : str 
    origin : str 
    destination : str 
    departure_time : datetime
    arrival_time : datetime 
    classes : Optional[List[FlightClassResponse]] = [] 

    class Config : 
        from_attributes = True    
