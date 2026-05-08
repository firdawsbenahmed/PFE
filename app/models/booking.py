from sqlalchemy import Column, Integer, String , DateTime,ForeignKey
from app.core.database import Base
from sqlalchemy.sql import func
class Booking(Base): 
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    flight_class_id = Column(Integer, ForeignKey("flight_class.id"), nullable=False)
    passenger_name = Column(String, nullable=False)
    passenger_email = Column(String, nullable=False)
    status = Column(String ,default="reserved", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())