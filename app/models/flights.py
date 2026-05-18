from sqlalchemy import Column, String,ForeignKey,Integer,DateTime
from app.core.database import Base

class Flight(Base) : 
    __tablename__ = "flights"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    flight_number = Column(String, nullable=False)
    origin = Column(String ,nullable=False )
    destination = Column(String , nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    status = Column(String , nullable=False , default="scheduled")
