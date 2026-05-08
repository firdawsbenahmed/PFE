from sqlalchemy import Column, Integer, String, DateTime,Enum
from sqlalchemy.sql import func
from app.core.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(Enum("retail","aviation", name = "industry_Enum"), nullable=False)
    email = Column(String, nullable=False, unique=True)
    status = Column(String, nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())