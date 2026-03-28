from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy import UniqueConstraint

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    sku = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
    UniqueConstraint("company_id", "sku", name="unique_product_sku_per_company"),
)