from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy import UniqueConstraint

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)

    quantity = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("company_id", "product_id", "store_id", name="unique_inventory_per_store"),
    )