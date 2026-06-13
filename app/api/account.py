from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import verify_password
from app.models.user import User
from app.models.company import Company
from app.models.booking import Booking
from app.models.flights import Flight
from app.models.flight_classes import Flight_class

router = APIRouter(prefix="/account", tags=["account"])


class ConfirmPasswordRequest(BaseModel):
    password: str   # require the user to confirm their password before destructive actions


# ═══════════════════════════════════════════════════════════════════════════
#  POST /account/deactivate
#  Soft-disable: the account still exists in DB but cannot log in.
#  Requires password confirmation so nobody deactivates accidentally.
# ═══════════════════════════════════════════════════════════════════════════
@router.post("/deactivate")
def deactivate_account(
    data: ConfirmPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deactivates the calling user's own account.
    - Verifies password before proceeding (safety gate).
    - Sets is_active = False — login endpoint already blocks inactive users.
    - If the user is the sole admin of the company, we block deactivation
      to prevent the company from becoming unmanageable.
    """
    # Password confirmation
    if not verify_password(data.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    if current_user.is_active is False:
        raise HTTPException(status_code=400, detail="Account is already deactivated")

    # If this user is an admin, make sure there is at least one other active admin
    if current_user.role == "admin":
        other_admins = db.query(User).filter(
            User.company_id == current_user.company_id,
            User.role == "admin",
            User.is_active == True,
            User.id != current_user.id
        ).count()

        if other_admins == 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "You are the only active admin. "
                    "Assign another admin before deactivating your account."
                )
            )

    current_user.is_active = False
    db.commit()

    return {"message": "Your account has been deactivated. Contact your admin to reactivate it."}


# ═══════════════════════════════════════════════════════════════════════════
#  DELETE /account/delete
#  Hard delete: removes the user row permanently.
#  Admin-level hard delete also wipes the entire company and all its data.
# ═══════════════════════════════════════════════════════════════════════════
@router.delete("/delete")
def delete_account(
    data: ConfirmPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently deletes the calling user's account.

    TWO BEHAVIOURS depending on role:

    1. Employee:
       - Only their own User row is deleted.
       - Company data is untouched.

    2. Admin (sole admin of company):
       - Deletes ALL company data in safe order:
         bookings → flight_classes → flights → users → company
       - This is a nuclear action — we warn in the response for the frontend
         to show a strong confirmation dialog before calling this.

    Either way, password confirmation is required.
    """
    if not verify_password(data.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # ── Employee: simple self-delete ────────────────────────────────────────
    if current_user.role == "employee":
        db.delete(current_user)
        db.commit()
        return {"message": "Your account has been permanently deleted."}

    # ── Admin path ──────────────────────────────────────────────────────────
    other_admins = db.query(User).filter(
        User.company_id == current_user.company_id,
        User.role == "admin",
        User.id != current_user.id
    ).count()

    # If other admins exist, just delete this user — the company survives
    if other_admins > 0:
        db.delete(current_user)
        db.commit()
        return {"message": "Your admin account has been permanently deleted."}

    # Sole admin → wipe the entire company
    company_id = current_user.company_id

    # Delete in FK-safe order
    # 1. Bookings (reference flights and flight_classes)
    flight_ids = [
        f.id for f in db.query(Flight).filter(Flight.company_id == company_id).all()
    ]
    if flight_ids:
        db.query(Booking).filter(Booking.flight_id.in_(flight_ids)).delete(
            synchronize_session=False
        )
        db.query(Flight_class).filter(Flight_class.flight_id.in_(flight_ids)).delete(
            synchronize_session=False
        )
        db.query(Flight).filter(Flight.company_id == company_id).delete(
            synchronize_session=False
        )

    # 2. Users (including current_user)
    db.query(User).filter(User.company_id == company_id).delete(
        synchronize_session=False
    )

    # 3. Company itself
    company = db.query(Company).filter(Company.id == company_id).first()
    if company:
        db.delete(company)

    db.commit()

    return {
        "message": (
            "Your company and all associated data have been permanently deleted. "
            "This action cannot be undone."
        )
    }