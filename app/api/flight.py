from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.flight_classes import Flight_class
from app.models.flights import Flight
from app.models.company import Company
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
@router.get("/{flight_id}/available")
def available_seats(
    flight_id : int ,
    db : Session = Depends(get_db)
) : 
    flight = db.query(Flight).filter(
        Flight.id == flight_id
    ).first()
    if not flight : 
        raise HTTPException(status_code=404 , detail="the flight does not exist")
    classes = db.query(Flight_class).filter(
        Flight_class.flight_id == flight_id
    ).all()
    return {
        "flight_id" : flight_id,
        "classes" : classes
    }

@router.get("/", response_model=List[FlightResponse])
def get_flights(
    origin : str | None = Query(default = None),
    destination : str | None = Query(default=None),
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user),
):
    flight = db.query(Flight).filter(Flight.company_id == current_user.company_id) 

    if origin : 
        flight = flight.filter(Flight.origin == origin)
    if destination : 
        flight = flight.filter(Flight.destination == destination)
    return flight.all()

@router.get("/public/search", response_model=List[FlightResponse])
def public_search_flight(
    origin : str | None = Query(default=None),
    destination : str | None = Query(default=None),
    company_name : str | None = Query(default=None),
    db: Session = Depends(get_db)
) : 
    query = db.query(Flight)
    if company_name: 
        query = query.join(Company , Flight.company_id == Company.id) ### Connect each flight to its airline/company
        query = query.filter(Company.name.ilike(f"%{company_name}%")) ## Keep only flights whose company name matches the user input

    if origin : 
        query = query.filter(Flight.origin ==  origin)
    if destination : 
        query = query.filter(Flight.destination == destination)
    return query.all()

    
@router.get("/{flight_id}", response_model=FlightResponse)
def get_flight_by_id(
    flight_id : int ,
    db: Session = Depends(get_db),
    current_user : User = Depends(get_current_user),
) : 
    flight = db.query(Flight).filter(Flight.id == flight_id , Flight.company_id == current_user.company_id).first()

    if not flight : 
        raise HTTPException(status_code=404 , detail="the flight not found ")
    
    return flight 

