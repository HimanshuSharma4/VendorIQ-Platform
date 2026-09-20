from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="VENDOR") # Admin, Vendor, Procurement Manager, etc.
    is_active = Column(Boolean, default=True)


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    status = Column(String, default="Active") # Expected values: Active, Inactive, Pending