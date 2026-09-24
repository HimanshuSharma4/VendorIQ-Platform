from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
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
    
    # Ye nayi line add ki hai link banane ke liye
    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")


# ==========================================
# NAYA PURCHASE ORDER MODEL
# ==========================================
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id")) # Vendor table se link
    order_date = Column(DateTime, default=datetime.utcnow)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="Pending") # Pending, Approved, Delivered

    # Reverse relationship
    vendor = relationship("Vendor", back_populates="purchase_orders")

class Contract(Base):
    __tablename__ = "contracts"
    
    # Correction: 'primary_key' me underscore lagaya hai
    id = Column(Integer, primary_key=True, index=True) 
    contract_number = Column(String, unique=True, index=True)
    vendor_name = Column(String) 
    start_date = Column(String)
    end_date = Column(String)
    compliance_status = Column(String, default="Valid")

# ==========================================
# NAYA PROCUREMENT MODEL
# ==========================================
class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    vendor_name = Column(String)
    amount = Column(Float)
    status = Column(String, default="Pending") # Pending, Approved, In Transit

# ==========================================
# PERFORMANCE & RELIABILITY MODEL
# ==========================================
class VendorPerformance(Base):
    __tablename__ = "vendor_performance"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String, index=True)
    quality_rating = Column(Float) # Example: 4.5 out of 5
    delivery_time_days = Column(Integer) # Average days to deliver
    reliability_score = Column(Float) # Calculated percentage, e.g., 98.5
    review_notes = Column(String, nullable=True)