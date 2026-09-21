from pydantic import BaseModel, EmailStr
from datetime import datetime # Ye naya import add kiya hai

# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "VENDOR"

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
# --- Purchase Order Schemas (Naya) ---
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