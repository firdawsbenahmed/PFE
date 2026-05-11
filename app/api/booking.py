from fastapi import APIRouter, HTTPException,Query,Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.booking import BookinCreate, BookingResponse
from app.models.booking import Booking
from app.models.flights import Flight
from app.models.flight_classes import Flight_class

router = APIRouter(prefix="/bookings", tags=["bookings"])

## i'm sure i'm gonna need it in the mcp tools 
@router.post("/", response_model=BookingResponse)
def create_booking(
    booking : BookinCreate,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
) : 
    flight_existance = db.query(Flight).filter(
        Flight.company_id == current_user.company_id,
        Flight.id == booking.flight_id
    ).first()
    if not flight_existance : 
        raise HTTPException(status_code=404 , detail="flight not found")
    class_existance = db.query(Flight_class).filter(
        Flight_class.id == booking.flight_class_id,
        Flight_class.flight_id == booking.flight_id
    ).first()
    if not class_existance : 
        raise HTTPException(status_code=404 , detail="class not found")
    if class_existance.available_seats <= 0 :
        raise HTTPException(status_code=400 , detail="there are no available seats") 
    

    new_booking = Booking(
        company_id = flight_existance.company_id,
        flight_id = flight_existance.id,
        flight_class_id =class_existance.id,
        passenger_name = booking.passenger_name,
        passenger_email = booking.passenger_email,
        status = "reserved"
    )
    class_existance.available_seats -= 1

    db.add(new_booking),
    db.commit()
    db.refresh(new_booking)

    return new_booking  
## just in case the adm wants to see all the bookings 
@router.get("/", response_model=BookingResponse)
def get_bookings(
    db: Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
) : 
    bookings = db.query(Booking).filter(
        Booking.company_id == current_user.company_id,
    ).first()
    return bookings

## cancel the booking :(

@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def canceling_the_booking(
    booking_id = int ,
    db : Session = Depends(get_db),
    current_user : User = Depends(get_current_user),
    
) : 
    booking_exists = db.query(Booking).filter(
        Booking.company_id == current_user.company_id,
        Booking.id == booking_id
    ).first()
    if not booking_exists : 
        raise HTTPException(status_code=404, detail="the booking not found ")
    if Booking.status == "cancelled" : 
        raise HTTPException(status_code=404 , detail="the booking is already cancelled")
    ## to update the availabel seats after cancelling
    flight_class = db.query(Flight_class).filter(
        Flight_class.id == Booking.flight_class_id
    ).first()
    if not flight_class : 
        raise HTTPException(status_code=404 , detail="flight class not found")
    booking_exists.status = "cancelled"
    flight_class.available_seats += 1

    db.commit()
    db.refresh(booking_exists)

    return booking_exists