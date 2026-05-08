from sqlalchemy import Column, String,ForeignKey,Integer,DateTime
from app.core.database import Base

class FLights(Base) : 
    __tablename__ = "Flight"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company_id"), nullable=False)
    flight_number = Column(String, nullable=False)
    origin = Column(String ,nullable=False )
    destination = Column(String , nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
