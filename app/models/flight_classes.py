from sqlalchemy import Column, Integer,Enum, ForeignKey
from app.core.database import Base

class Flight_class(Base): 

    __tablename__ = "flight_class"

    id = Column(Integer, primary_key=True, index=True)
    flight_id = Column(Integer, ForeignKey("flights.id"),nullable=False)
    flight_class = Column(Enum("economy","buisness","first", name="flight_class_Enum"), nullable=False)
    price = Column(Integer, nullable=False)
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
