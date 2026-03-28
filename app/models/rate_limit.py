from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy import func 
from app.core.database import Base 

class Rate_limit(Base): 
    __tablename__ = "rate_limits"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    resource_type = Column(String, nullable=False)
    window_start = Column(DateTime, nullable=False)
    request_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

