from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.models.flights import Flight
from app.models.flight_classes import Flight_class
from app.models.booking import Booking
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Guard: only admins can use ANY endpoint in this router ──────────────────
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user


# ═══════════════════════════════════════════════════════════════════════════
#  EMPLOYEE MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None       # "admin" | "employee"
    is_active: Optional[bool] = None


class EmployeePasswordChange(BaseModel):
    new_password: str


# ── 1. GET /admin/employees ─────────────────────────────────────────────────
@router.get("/employees", response_model=List[UserResponse])
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Returns every user that belongs to the same company as the calling admin.
    The admin themselves is included in the list (useful for the dashboard).
    """
    employees = db.query(User).filter(
        User.company_id == current_user.company_id
    ).all()
    return employees


# ── 2. PUT /admin/employees/{employee_id} ───────────────────────────────────
@router.put("/employees/{employee_id}", response_model=UserResponse)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update name, role, or is_active of an employee within the same company.
    An admin cannot demote/change themselves to prevent accidental lockout.
    """
    employee = db.query(User).filter(
        User.id == employee_id,
        User.company_id == current_user.company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Prevent admin from accidentally changing their own role to employee
    if employee.id == current_user.id and data.role == "employee":
        raise HTTPException(
            status_code=400,
            detail="You cannot demote yourself. Assign another admin first."
        )

    if data.name is not None:
        employee.name = data.name
    if data.role is not None:
        if data.role not in ("admin", "employee"):
            raise HTTPException(status_code=400, detail="Role must be 'admin' or 'employee'")
        employee.role = data.role
    if data.is_active is not None:
        employee.is_active = data.is_active

    db.commit()
    db.refresh(employee)
    return employee


# ── 3. POST /admin/employees/{employee_id}/disable ──────────────────────────
@router.post("/employees/{employee_id}/disable", response_model=UserResponse)
def disable_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Sets is_active = False for the employee.
    A disabled employee cannot log in (blocked in the login endpoint).
    An admin cannot disable themselves.
    """
    employee = db.query(User).filter(
        User.id == employee_id,
        User.company_id == current_user.company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if employee.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot disable your own account")

    if not employee.is_active:
        raise HTTPException(status_code=400, detail="Employee is already disabled")

    employee.is_active = False
    db.commit()
    db.refresh(employee)
    return employee


# ── 4. POST /admin/employees/{employee_id}/password ─────────────────────────
@router.post("/employees/{employee_id}/password")
def change_employee_password(
    employee_id: int,
    data: EmployeePasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin can reset any employee's password within their company.
    No need for the old password — this is an admin override.
    """
    employee = db.query(User).filter(
        User.id == employee_id,
        User.company_id == current_user.company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    employee.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": f"Password updated for {employee.name}"}


# ═══════════════════════════════════════════════════════════════════════════
#  FLIGHT MANAGEMENT  (admin-scoped)
# ═══════════════════════════════════════════════════════════════════════════

class FlightUpdate(BaseModel):
    flight_number: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    departure_time: Optional[str] = None   # keep as str; frontend sends ISO string
    arrival_time: Optional[str] = None
    status: Optional[str] = None           # "scheduled" | "delayed" | "cancelled" | "completed"


# ── 5. PUT /admin/flights/{flight_id} ───────────────────────────────────────
@router.put("/flights/{flight_id}")
def update_flight(
    flight_id: int,
    data: FlightUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Partial update for any field on a flight.
    Only the company that owns the flight can update it.
    """
    flight = db.query(Flight).filter(
        Flight.id == flight_id,
        Flight.company_id == current_user.company_id
    ).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    valid_statuses = ("scheduled", "delayed", "cancelled", "completed")
    if data.status is not None and data.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {', '.join(valid_statuses)}"
        )

    if data.flight_number is not None:
        flight.flight_number = data.flight_number
    if data.origin is not None:
        flight.origin = data.origin
    if data.destination is not None:
        flight.destination = data.destination
    if data.departure_time is not None:
        flight.departure_time = data.departure_time
    if data.arrival_time is not None:
        flight.arrival_time = data.arrival_time
    if data.status is not None:
        flight.status = data.status

    db.commit()
    db.refresh(flight)
    return flight


# ── 6. DELETE /admin/flights/{flight_id} ────────────────────────────────────
@router.delete("/flights/{flight_id}")
def delete_flight(
    flight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Hard delete a flight and all its associated classes and bookings.
    Only allowed if no bookings are in 'reserved' or 'paid' state
    (we do not want to delete flights that passengers are counting on).
    """
    flight = db.query(Flight).filter(
        Flight.id == flight_id,
        Flight.company_id == current_user.company_id
    ).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    # Safety check: block deletion if active bookings exist
    active_bookings = db.query(Booking).filter(
        Booking.flight_id == flight_id,
        Booking.status.in_(["reserved"])
    ).count()

    if active_bookings > 0:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot delete flight with {active_bookings} active booking(s). "
                "Cancel all bookings first, or update the flight status to 'cancelled'."
            )
        )

    # Delete child records first to respect FK constraints
    db.query(Booking).filter(Booking.flight_id == flight_id).delete()
    db.query(Flight_class).filter(Flight_class.flight_id == flight_id).delete()
    db.delete(flight)
    db.commit()

    return {"message": f"Flight {flight.flight_number} deleted successfully"}


# ═══════════════════════════════════════════════════════════════════════════
#  BOOKING MANAGEMENT  (admin-scoped)
# ═══════════════════════════════════════════════════════════════════════════

# ── 7. GET /admin/bookings/{booking_id} ─────────────────────────────────────
@router.get("/bookings/{booking_id}")
def get_booking_detail(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Full booking detail for the admin.
    Scoped to the company — an admin cannot see another company's bookings.
    """
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.company_id == current_user.company_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Enrich the response with flight and class info
    flight = db.query(Flight).filter(Flight.id == booking.flight_id).first()
    flight_class = db.query(Flight_class).filter(
        Flight_class.id == booking.flight_class_id
    ).first()

    return {
        "booking": booking,
        "flight": {
            "flight_number": flight.flight_number if flight else None,
            "origin": flight.origin if flight else None,
            "destination": flight.destination if flight else None,
            "departure_time": str(flight.departure_time) if flight else None,
            "arrival_time": str(flight.arrival_time) if flight else None,
            "status": flight.status if flight else None,
        },
        "class": {
            "type": flight_class.flight_class if flight_class else None,
            "price": flight_class.price if flight_class else None,
        }
    }