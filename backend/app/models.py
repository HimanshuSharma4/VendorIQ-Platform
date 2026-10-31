
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    ForeignKey,
    Date,
    DateTime,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base
from sqlalchemy import JSON


# =========================
# USER MODEL
# =========================
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# =========================
# VENDOR MODEL
# =========================
class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String, nullable=False)
    category = Column(String)
    contact_person = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    gst_number = Column(String, unique=True)
    status = Column(String, default="Active")
    registration_date = Column(Date, server_default=func.now())

    products = relationship("Product", back_populates="vendor")
    contracts = relationship("Contract", back_populates="vendor")
    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")
    performance = relationship(
        "VendorPerformance",
        back_populates="vendor",
        uselist=False,
    )


# =========================
# PRODUCT MODEL
# =========================
class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    product_name = Column(String, nullable=False)
    category = Column(String)
    unit_price = Column(Float, nullable=False)
    stock_unit = Column(String)
    lead_time_days = Column(Integer)
    warranty_months = Column(Integer)

    vendor = relationship("Vendor", back_populates="products")


# =========================
# CONTRACT MODEL
# =========================
class Contract(Base):
    __tablename__ = "contracts"

    contract_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    contract_value = Column(Float)
    compliance_status = Column(String)
    renewal_status = Column(String)

    vendor = relationship("Vendor", back_populates="contracts")


# =========================
# PURCHASE ORDER MODEL
# =========================
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    po_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    product_id = Column(Integer, ForeignKey("products.product_id"))
    po_number = Column(String, unique=True, index=True, nullable=False)
    order_date = Column(Date, server_default=func.now())
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    expected_delivery_date = Column(Date)
    actual_delivery_date = Column(Date)
    order_status = Column(String, default="Pending")
    created_by = Column(Integer, ForeignKey("users.user_id"))

    vendor = relationship("Vendor", back_populates="purchase_orders")
    product = relationship("Product")
    creator = relationship("User")
    deliveries = relationship("Delivery", back_populates="purchase_order")
    invoices = relationship("Invoice", back_populates="purchase_order")


# =========================
# DELIVERY MODEL
# =========================
class Delivery(Base):
    __tablename__ = "deliveries"

    delivery_id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.po_id"))
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    delivery_date = Column(Date)
    expected_delivery_date = Column(Date)
    delay_days = Column(Integer, default=0)
    delivery_status = Column(String)
    damaged_goods = Column(Integer, default=0)
    delivery_notes = Column(Text)

    purchase_order = relationship("PurchaseOrder", back_populates="deliveries")


# =========================
# INVOICE MODEL
# =========================
class Invoice(Base):
    __tablename__ = "invoices"

    invoice_id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.po_id"))
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    invoice_number = Column(String, unique=True, nullable=False)
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    invoice_amount = Column(Float, nullable=False)
    payment_date = Column(Date)
    payment_status = Column(String, default="Pending")

    purchase_order = relationship("PurchaseOrder", back_populates="invoices")


# =========================
# QUALITY INSPECTION MODEL
# =========================
class QualityInspection(Base):
    __tablename__ = "quality_inspection"

    inspection_id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.po_id"))
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    inspection_date = Column(Date)
    quality_score = Column(Float)
    defective_quantity = Column(Integer, default=0)
    remarks = Column(Text)
    inspected_by = Column(Integer, ForeignKey("users.user_id"))


# =========================
# COMMUNICATION MODEL
# =========================
class Communication(Base):
    __tablename__ = "communications"

    communication_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    message_type = Column(String)
    subject = Column(String)
    message_body = Column(Text)
    response_time = Column(Float)
    issue_status = Column(String)
    resolution_time = Column(Float)
    communication_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    created_by = Column(Integer, ForeignKey("users.user_id"))


# =========================
# NOTIFICATION MODEL
# =========================
class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    notification_type = Column(String)
    message = Column(Text)
    status = Column(String, default="Unread")
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.user_id"))


# =========================
# VENDOR PERFORMANCE MODEL
# =========================
class VendorPerformance(Base):
    __tablename__ = "vendor_performance"

    performance_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        unique=True,
    )
    total_orders = Column(Integer, default=0)
    completed_orders = Column(Integer, default=0)
    on_time_delivery_percentage = Column(Float, default=0.0)
    average_delay_days = Column(Float, default=0.0)
    quality_score = Column(Float, default=0.0)
    average_response_time_hours = Column(Float, default=0.0)
    contract_compliance_percentage = Column(Float, default=0.0)
    reliability_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Low")
    calculated_on = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
    )

    vendor = relationship("Vendor", back_populates="performance")


# =========================
# ACTIVITY LOG MODEL
# =========================
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    log_id = Column(Integer, primary_key=True, index=True)

    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=True,
    )
    user_name = Column(String, nullable=False, default="System")

    action = Column(String, nullable=False)
    module = Column(String, nullable=False)

    severity = Column(String, nullable=False, default="Info")
    status = Column(String, nullable=False, default="Success")

    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)

# =========================
# PROCUREMENT MODEL
# =========================
class Procurement(Base):
    __tablename__ = "procurements"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    vendor_name = Column(String, index=True)
    amount = Column(Float)
    status = Column(String, default="Pending")

# =========================
# ROLE & PERMISSION MODEL
# =========================
class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    users = Column(Integer, default=0)
    level = Column(String, default="Custom")
    color = Column(String, default="blue")
    permissions = Column(JSON, default=dict) # JSON format me permissions save hongi