from sqlalchemy import Column, String, Integer,DateTime, ForeignKey , Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class EmailVerificationToken(Base) : 
    __tablename__ = "email_verification_token"

    id = Column(Integer , primary_key=True , index=True )
    user_id = Column(Integer , ForeignKey("users.id"), nullable=False)
    token = Column(String, nullable=False , unique=True , index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean , default=False)
    created_at =  Column(DateTime(timezone=True), server_default=func.now())