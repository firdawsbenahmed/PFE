from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Endpoints(Base): 
    __tablename__ = "endpoints"

    id = Column(Integer, primary_key=True, nullable=False)
    api_integration_id = Column(Integer , ForeignKey("api_integrations.id"), nullable=False)
    name=Column(String, nullable=False)
    endpoint_type = Column(String , nullable=False)
    path = Column(String , nullable=False)
    method = Column(String , nullable=False)
    is_active = Column(Boolean , default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True) , onupdate=func.now())
    