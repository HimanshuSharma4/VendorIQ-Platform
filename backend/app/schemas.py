from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    status: Optional[str] = "Active"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Vendor Schemas ---
class VendorBase(BaseModel):
    vendor_name: str
    category: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    gst_number: Optional[str] = None
    status: Optional[str] = "Active"

class VendorCreate(VendorBase):
    pass

class VendorResponse(VendorBase):
    vendor_id: int
    registration_date: date

    class Config:
        from_attributes = True

# --- Product Schemas ---
class ProductBase(BaseModel):
    vendor_id: int
    product_name: str
    category: Optional[str] = None
    unit_price: float
    stock_unit: Optional[str] = None
    lead_time_days: Optional[int] = None
    warranty_months: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    product_id: int

    class Config:
        from_attributes = True

# --- Contract Schemas ---
class ContractBase(BaseModel):
    vendor_id: int
    start_date: date
    end_date: date
    contract_value: Optional[float] = None
    compliance_status: Optional[str] = None
    renewal_status: Optional[str] = None

class ContractCreate(ContractBase):
    pass

class ContractResponse(ContractBase):
    contract_id: int

    class Config:
        from_attributes = True

# --- Purchase Order Schemas ---
class PurchaseOrderBase(BaseModel):
    vendor_id: int
    product_id: int
    po_number: str
    quantity: int
    unit_price: float
    total_amount: float
    expected_delivery_date: Optional[date] = None
    actual_delivery_date: Optional[date] = None
    order_status: Optional[str] = "Pending"
    created_by: Optional[int] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderResponse(PurchaseOrderBase):
    po_id: int
    order_date: date

    class Config:
        from_attributes = True

# --- Delivery Schemas ---
class DeliveryBase(BaseModel):
    po_id: int
    vendor_id: int
    delivery_date: Optional[date] = None
    expected_delivery_date: Optional[date] = None
    delay_days: Optional[int] = 0
    delivery_status: Optional[str] = None
    damaged_goods: Optional[int] = 0
    delivery_notes: Optional[str] = None

class DeliveryCreate(DeliveryBase):
    pass

class DeliveryResponse(DeliveryBase):
    delivery_id: int

    class Config:
        from_attributes = True

# --- Invoice Schemas ---
class InvoiceBase(BaseModel):
    po_id: int
    vendor_id: int
    invoice_number: str
    invoice_date: date
    due_date: date
    invoice_amount: float
    payment_date: Optional[date] = None
    payment_status: Optional[str] = "Pending"

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    invoice_id: int

    class Config:
        from_attributes = True

# --- Quality Inspection Schemas ---
class QualityInspectionBase(BaseModel):
    po_id: int
    vendor_id: int
    inspection_date: Optional[date] = None
    quality_score: Optional[float] = None
    defective_quantity: Optional[int] = 0
    remarks: Optional[str] = None
    inspected_by: Optional[int] = None

class QualityInspectionCreate(QualityInspectionBase):
    pass

class QualityInspectionResponse(QualityInspectionBase):
    inspection_id: int

    class Config:
        from_attributes = True

# --- Communication Schemas ---
class CommunicationBase(BaseModel):
    vendor_id: int
    message_type: Optional[str] = None
    subject: Optional[str] = None
    response_time: Optional[float] = None
    issue_status: Optional[str] = None
    resolution_time: Optional[float] = None
    created_by: Optional[int] = None

class CommunicationCreate(CommunicationBase):
    pass

class CommunicationResponse(CommunicationBase):
    communication_id: int
    communication_date: datetime

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationBase(BaseModel):
    vendor_id: Optional[int] = None
    notification_type: Optional[str] = None
    message: str
    status: Optional[str] = "Unread"
    created_by: Optional[int] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    notification_id: int
    created_date: datetime

    class Config:
        from_attributes = True

# --- Vendor Performance Schemas ---
class VendorPerformanceBase(BaseModel):
    vendor_id: int
    total_orders: Optional[int] = 0
    completed_orders: Optional[int] = 0
    on_time_delivery_percentage: Optional[float] = 0.0
    average_delay_days: Optional[float] = 0.0
    quality_score: Optional[float] = 0.0
    average_response_time_hours: Optional[float] = 0.0
    contract_compliance_percentage: Optional[float] = 0.0
    reliability_score: Optional[float] = 0.0
    risk_level: Optional[str] = "Low"

class VendorPerformanceCreate(VendorPerformanceBase):
    pass

class VendorPerformanceResponse(VendorPerformanceBase):
    performance_id: int

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

from datetime import date
from typing import Optional

class DeliveryBase(BaseModel):
    po_id: int
    vendor_id: int
    delivery_date: date
    expected_delivery_date: date
    delay_days: int = 0
    delivery_status: str
    damaged_goods: int = 0
    delivery_notes: Optional[str] = None

class DeliveryCreate(DeliveryBase):
    pass

class DeliveryResponse(DeliveryBase):
    delivery_id: int
    class Config:
        from_attributes = True

# ==========================================
# INVOICES SCHEMAS
# ==========================================
class InvoiceBase(BaseModel):
    po_id: int
    vendor_id: int
    invoice_number: str
    invoice_date: date
    due_date: date
    invoice_amount: float
    payment_date: Optional[date] = None
    payment_status: str = "Pending"

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    invoice_id: int
    class Config:
        from_attributes = True

# ==========================================
# QUALITY INSPECTION SCHEMAS
# ==========================================
class QualityInspectionBase(BaseModel):
    po_id: int
    vendor_id: int
    inspection_date: date
    quality_score: float
    defective_quantity: int = 0
    remarks: Optional[str] = None
    inspected_by: Optional[int] = None

class QualityInspectionCreate(QualityInspectionBase):
    pass

class QualityInspectionResponse(QualityInspectionBase):
    inspection_id: int
    class Config:
        from_attributes = True

# ==========================================
# COMMUNICATIONS SCHEMAS
# ==========================================
class CommunicationBase(BaseModel):
    vendor_id: int
    created_by: int  # ERD name (instead of user_id)
    message_type: str
    subject: str
    message_body: str  # Kept to support UI message pop-up
    communication_date: date  # ERD name (instead of sent_date)
    response_time: Optional[int] = None
    issue_status: str = "Open"
    resolution_time: Optional[int] = None

class CommunicationCreate(CommunicationBase):
    pass

class CommunicationResponse(CommunicationBase):
    communication_id: int  # ERD exact PK name
    class Config:
        from_attributes = True