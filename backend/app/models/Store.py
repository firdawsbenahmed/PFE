from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import UniqueConstraint
from app.core.database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    name = Column(String, nullable=False)
    location = Column(String ,nullable=False)

    ## responsible employee for this store (nullable — a store can be unassigned)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at= Column(DateTime(timezone=True), server_default=func.now())
    __table_arg__ = (
        UniqueConstraint("company_id","name", name="Unique_store_name_per_company" )
    )