from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Mcp_tool_p(Base):
     
     id = Column(Integer, primary_key=True, index=True)

     company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

     tool_name = Column(String, nullable=False)
     is_enabled = Column(Boolean, default=True)

     created_at = Column(DateTime(timezone=True), server_default=func.now())
     updated_at = Column(DateTime(timezone=True) , onupdate=func.now())