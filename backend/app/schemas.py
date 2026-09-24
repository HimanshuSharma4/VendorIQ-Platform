from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from enum import Enum

# --- Enums (New Alignments with Documentation) ---
class VendorCategoryEnum(str, Enum):
    raw_material = "Raw Material"
    equipment = "Equipment"
    it = "IT"
    service = "Service"
    logistics = "Logistics"
    maintenance = "Maintenance"

class UserRoleEnum(str, Enum):
    administrator = "Administrator"
    procurement_manager = "Procurement Manager"
    supply_chain_manager = "Supply Chain Manager"
    vendor = "Vendor"
    finance_officer = "Finance Officer"
    auditor = "Auditor"

# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = UserRoleEnum.vendor

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Vendor Schemas ---
class VendorCreate(BaseModel):
    vendor_name: str
    category: str
    status: str = "Active"

class VendorResponse(BaseModel):
    id: int
    vendor_name: str
    category: str
    status: str

    class Config:
        from_attributes = True

# ==========================================
# --- Purchase Order Schemas ---
# ==========================================
class PurchaseOrderBase(BaseModel):
    po_number: str
    vendor_id: int
    total_amount: float
    status: str = "Pending"

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderResponse(PurchaseOrderBase):
    id: int
    order_date: datetime

    class Config:
        from_attributes = True

# --- Contract Schemas ---
class ContractBase(BaseModel):
    contract_number: str
    vendor_name: str
    start_date: str
    end_date: str
    compliance_status: str

class ContractCreate(ContractBase):
    pass

class ContractResponse(ContractBase):
    id: int

    class Config:
        orm_mode = True

# --- Procurement Schemas ---
class ProcurementCreate(BaseModel):
    description: str
    vendor_name: str
    amount: float
    status: str = "Pending"

class ProcurementResponse(ProcurementCreate):
    id: int

    class Config:
        orm_mode = True

# --- Performance Schemas ---
class PerformanceCreate(BaseModel):
    vendor_name: str
    quality_rating: float
    delivery_time_days: int
    reliability_score: float
    review_notes: Optional[str] = None

class PerformanceResponse(PerformanceCreate):
    id: int

    class Config:
        orm_mode = True