from pydantic import BaseModel , Field
from datetime import datetime
from typing import Literal, List, Optional

class CreateFlightClass(BaseModel): 
    class_type : Literal["economy","buisness","first"]
    price : int = Field(gt = 0)
    total_seats : int = Field(gt = 0) 

class CreateFlight(BaseModel): 
    flight_number : str 
    origin : str 
    destination : str 
    departure_time : datetime
    arrival_time : datetime 
    classes : List[CreateFlightClass]

class FlightClassResponse(BaseModel): 
    id : int
    flight_id : int 
    class_type : str
    price : int 
    total_seats : int 
    available_seats : int 
    
    class Config : 
        from_attributes = True 

class FlightResponse(BaseModel): 
    id : int 
    flight_number : str 
    origin : str 
    destination : str 
    departure_time : datetime
    arrival_time : datetime 
    classes : Optional[List[CreateFlightClass]] = [] 

    class Config : 
        from_attributes = True    
