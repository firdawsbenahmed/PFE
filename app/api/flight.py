from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_current_user
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.flight_classes import Flight_class
from app.models.flights import Flight
from app.schemas.flight import FlightCreate,FlightResponse

router = APIRouter(prefix="/flights",tags=["flights"])

@router.post("/", response_model=FlightResponse)
def create_flight(
    flight: FlightCreate ,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
) : 
    new_flight =  Flight(
        company_id = current_user.company_id,
        flight_number = flight.flight_number,
        origin = flight.origin,
        destination = flight.destination,
        departure_time =flight.departure_time,
        arrival_time = flight.arrival_time
    )
    db.add(new_flight)
    db.flush()

    for class_item in flight.classes:
        new_class = Flight_class (
            flight_id = new_flight.id,
            flight_class = class_item.class_type,
            price = class_item.price,
            total_seats = class_item.total_seats,
            available_seats = class_item.total_seats
        )
    db.add(new_class)
    db.commit()
    db.refresh(new_flight)

    return new_flight

@router.get("/", response_model=List[FlightResponse])
def get_flights(
   
    origin : str | None = Query(default = None),
    destination : str | None = Query(default=None),
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user),
):
    flight = db.query(Flight).filter(Flight.company_id == current_user.company_id) 

    if origin : 
        query = flight.filter(Flight.origin == origin)
    if destination : 
        query = flight.filter(Flight.destination == destination)
    
    return query.all()
