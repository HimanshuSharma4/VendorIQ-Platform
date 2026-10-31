from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, get_db


# ==========================================
# DATABASE INITIALIZATION
# ==========================================
models.Base.metadata.create_all(bind=engine)


# ==========================================
# FASTAPI APPLICATION
# ==========================================
app = FastAPI(title="VendorIQ Reliability Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# REQUEST MODELS
# ==========================================
class LoginRequest(BaseModel):
    email: str
    password: str


class ActivityLogCreate(BaseModel):
    user_id: Optional[int] = None
    user_name: str = "System"
    action: str
    module: str
    severity: str = "Info"
    status: str = "Success"
    details: Optional[str] = None
    ip_address: Optional[str] = None


# ==========================================
# 1. USERS API & AUTH
# ==========================================
@app.post("/users/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/users/login")
def login_json(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == req.email
    ).first()

    if not user or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Bulletproof approach to avoid 500 Internal Server Errors
    user_role = getattr(user, 'role', 'Admin')
    user_name = getattr(user, 'username', getattr(user, 'name', 'Admin User'))

    return {
        "access_token": user.email, 
        "token_type": "bearer",
        "role": user_role,
        "name": user_name
    }


@app.post("/token")
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not user or user.password != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"access_token": user.email, "token_type": "bearer"}


@app.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_data: schemas.UserBase,
    db: Session = Depends(get_db),
):
    db_user = db.query(models.User).filter(
        models.User.user_id == user_id
    ).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_data.model_dump(exclude_unset=True).items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.user_id == user_id
    ).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}


# ==========================================
# 2. VENDORS API
# ==========================================
@app.get("/vendors", response_model=List[schemas.VendorResponse])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(models.Vendor).all()


@app.post("/vendors", response_model=schemas.VendorResponse)
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    db_vendor = models.Vendor(**vendor.model_dump())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


@app.put("/vendors/{vendor_id}", response_model=schemas.VendorResponse)
def update_vendor(
    vendor_id: int,
    vendor_data: schemas.VendorCreate,
    db: Session = Depends(get_db),
):
    db_vendor = db.query(models.Vendor).filter(
        models.Vendor.vendor_id == vendor_id
    ).first()

    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    for key, value in vendor_data.model_dump(exclude_unset=True).items():
        setattr(db_vendor, key, value)

    db.commit()
    db.refresh(db_vendor)
    return db_vendor


@app.delete("/vendors/{vendor_id}")
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    db_vendor = db.query(models.Vendor).filter(
        models.Vendor.vendor_id == vendor_id
    ).first()

    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    db.delete(db_vendor)
    db.commit()
    return {"message": "Vendor deleted successfully"}


# ==========================================
# 3. PRODUCTS API
# ==========================================
@app.get("/products", response_model=List[schemas.ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


@app.post("/products", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@app.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
):
    db_product = db.query(models.Product).filter(
        models.Product.product_id == product_id
    ).first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product_data.model_dump(exclude_unset=True).items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product


@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(
        models.Product.product_id == product_id
    ).first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}


# ==========================================
# 4. PURCHASE ORDERS API
# ==========================================
@app.get("/purchase-orders", response_model=List[schemas.PurchaseOrderResponse])
def get_purchase_orders(db: Session = Depends(get_db)):
    return db.query(models.PurchaseOrder).all()


@app.post("/purchase-orders", response_model=schemas.PurchaseOrderResponse)
def create_purchase_order(
    po: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db),
):
    db_po = models.PurchaseOrder(**po.model_dump())
    db.add(db_po)
    db.commit()
    db.refresh(db_po)
    return db_po


@app.put("/purchase-orders/{po_id}", response_model=schemas.PurchaseOrderResponse)
def update_purchase_order(
    po_id: int,
    po_data: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db),
):
    db_po = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.po_id == po_id
    ).first()

    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    for key, value in po_data.model_dump(exclude_unset=True).items():
        setattr(db_po, key, value)

    db.commit()
    db.refresh(db_po)
    return db_po


@app.delete("/purchase-orders/{po_id}")
def delete_purchase_order(po_id: int, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.po_id == po_id
    ).first()

    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    db.delete(db_po)
    db.commit()
    return {"message": "Purchase Order deleted successfully"}


# ==========================================
# 5. DELIVERIES API
# ==========================================
@app.get("/deliveries", response_model=List[schemas.DeliveryResponse])
def get_deliveries(db: Session = Depends(get_db)):
    return db.query(models.Delivery).all()


@app.post("/deliveries", response_model=schemas.DeliveryResponse)
def create_delivery(
    delivery: schemas.DeliveryCreate,
    db: Session = Depends(get_db),
):
    db_delivery = models.Delivery(**delivery.model_dump())
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery


@app.put("/deliveries/{delivery_id}", response_model=schemas.DeliveryResponse)
def update_delivery(
    delivery_id: int,
    delivery_data: schemas.DeliveryCreate,
    db: Session = Depends(get_db),
):
    db_delivery = db.query(models.Delivery).filter(
        models.Delivery.delivery_id == delivery_id
    ).first()

    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    for key, value in delivery_data.model_dump(exclude_unset=True).items():
        setattr(db_delivery, key, value)

    db.commit()
    db.refresh(db_delivery)
    return db_delivery


@app.delete("/deliveries/{delivery_id}")
def delete_delivery(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(
        models.Delivery.delivery_id == delivery_id
    ).first()

    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    db.delete(db_delivery)
    db.commit()
    return {"message": "Delivery deleted successfully"}


# ==========================================
# 6. INVOICES API
# ==========================================
@app.get("/invoices", response_model=List[schemas.InvoiceResponse])
def get_invoices(db: Session = Depends(get_db)):
    return db.query(models.Invoice).all()


@app.post("/invoices", response_model=schemas.InvoiceResponse)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = models.Invoice(**invoice.model_dump())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


@app.put("/invoices/{invoice_id}", response_model=schemas.InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_data: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
):
    db_invoice = db.query(models.Invoice).filter(
        models.Invoice.invoice_id == invoice_id
    ).first()

    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    for key, value in invoice_data.model_dump(exclude_unset=True).items():
        setattr(db_invoice, key, value)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice


@app.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(models.Invoice).filter(
        models.Invoice.invoice_id == invoice_id
    ).first()

    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    db.delete(db_invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}


# ==========================================
# 7. QUALITY INSPECTION API
# ==========================================
@app.get(
    "/quality-inspections",
    response_model=List[schemas.QualityInspectionResponse],
)
def get_quality_inspections(db: Session = Depends(get_db)):
    return db.query(models.QualityInspection).all()


@app.post(
    "/quality-inspections",
    response_model=schemas.QualityInspectionResponse,
)
def create_quality_inspection(
    inspection: schemas.QualityInspectionCreate,
    db: Session = Depends(get_db),
):
    db_inspection = models.QualityInspection(**inspection.model_dump())
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection


@app.put(
    "/quality-inspections/{inspection_id}",
    response_model=schemas.QualityInspectionResponse,
)
def update_quality_inspection(
    inspection_id: int,
    inspection_data: schemas.QualityInspectionCreate,
    db: Session = Depends(get_db),
):
    db_inspection = db.query(models.QualityInspection).filter(
        models.QualityInspection.inspection_id == inspection_id
    ).first()

    if not db_inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    for key, value in inspection_data.model_dump(exclude_unset=True).items():
        setattr(db_inspection, key, value)

    db.commit()
    db.refresh(db_inspection)
    return db_inspection


@app.delete("/quality-inspections/{inspection_id}")
def delete_quality_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
):
    db_inspection = db.query(models.QualityInspection).filter(
        models.QualityInspection.inspection_id == inspection_id
    ).first()

    if not db_inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    db.delete(db_inspection)
    db.commit()
    return {"message": "Inspection deleted successfully"}


# ==========================================
# 8. COMMUNICATIONS API
# ==========================================
@app.get("/communications", response_model=List[schemas.CommunicationResponse])
def get_communications(db: Session = Depends(get_db)):
    return db.query(models.Communication).all()


@app.post("/communications", response_model=schemas.CommunicationResponse)
def create_communication(
    comm: schemas.CommunicationCreate,
    db: Session = Depends(get_db),
):
    db_comm = models.Communication(**comm.model_dump())
    db.add(db_comm)
    db.commit()
    db.refresh(db_comm)
    return db_comm


@app.put(
    "/communications/{communication_id}",
    response_model=schemas.CommunicationResponse,
)
def update_communication(
    communication_id: int,
    comm_data: schemas.CommunicationCreate,
    db: Session = Depends(get_db),
):
    db_comm = db.query(models.Communication).filter(
        models.Communication.communication_id == communication_id
    ).first()

    if not db_comm:
        raise HTTPException(status_code=404, detail="Record not found")

    for key, value in comm_data.model_dump(exclude_unset=True).items():
        setattr(db_comm, key, value)

    db.commit()
    db.refresh(db_comm)
    return db_comm


@app.delete("/communications/{communication_id}")
def delete_communication(
    communication_id: int,
    db: Session = Depends(get_db),
):
    db_comm = db.query(models.Communication).filter(
        models.Communication.communication_id == communication_id
    ).first()

    if not db_comm:
        raise HTTPException(status_code=404, detail="Record not found")

    db.delete(db_comm)
    db.commit()
    return {"message": "Record deleted successfully"}


# ==========================================
# 9. NOTIFICATIONS API
# ==========================================
@app.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(models.Notification).all()


@app.post("/notifications", response_model=schemas.NotificationResponse)
def create_notification(
    notif: schemas.NotificationCreate,
    db: Session = Depends(get_db),
):
    db_notif = models.Notification(**notif.model_dump())
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif


@app.put(
    "/notifications/{notification_id}/read",
    response_model=schemas.NotificationResponse,
)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
):
    db_notif = db.query(models.Notification).filter(
        models.Notification.notification_id == notification_id
    ).first()

    if not db_notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    db_notif.status = "Read"
    db.commit()
    db.refresh(db_notif)
    return db_notif


@app.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
):
    db_notif = db.query(models.Notification).filter(
        models.Notification.notification_id == notification_id
    ).first()

    if not db_notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(db_notif)
    db.commit()
    return {"message": "Notification deleted successfully"}


# ==========================================
# 10. DASHBOARD ANALYTICS API
# ==========================================
@app.get("/analytics")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    total_vendors = db.query(models.Vendor).count()
    active_vendors = db.query(models.Vendor).filter(
        models.Vendor.status == "Active"
    ).count()
    total_pos = db.query(models.PurchaseOrder).count()

    approved_spend = (
        db.query(func.sum(models.PurchaseOrder.total_amount))
        .filter(models.PurchaseOrder.order_status == "Approved")
        .scalar()
        or 0.0
    )

    return {
        "totalVendors": total_vendors,
        "activeVendors": active_vendors,
        "totalPurchaseOrders": total_pos,
        "approvedSpend": approved_spend,
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "total_purchase_orders": total_pos,
        "approved_spend": approved_spend,
    }


# ==========================================
# 11. ACTIVITY LOGS API
# ==========================================
@app.get("/activity-logs")
def get_activity_logs(
    search: Optional[str] = None,
    severity: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.ActivityLog)

    if search:
        term = f"%{search}%"
        query = query.filter(
            (models.ActivityLog.user_name.ilike(term))
            | (models.ActivityLog.action.ilike(term))
            | (models.ActivityLog.module.ilike(term))
            | (models.ActivityLog.details.ilike(term))
        )

    if severity and severity.lower() != "all":
        query = query.filter(models.ActivityLog.severity.ilike(severity))

    if status_filter and status_filter.lower() != "all":
        query = query.filter(models.ActivityLog.status.ilike(status_filter))

    total = query.count()

    logs = (
        query.order_by(models.ActivityLog.timestamp.desc())
        .offset(max(skip, 0))
        .limit(max(1, min(limit, 500)))
        .all()
    )

    return {
        "total": total,
        "items": [
            {
                "log_id": log.log_id,
                "timestamp": log.timestamp,
                "user_id": log.user_id,
                "user_name": log.user_name,
                "action": log.action,
                "module": log.module,
                "severity": log.severity,
                "status": log.status,
                "details": log.details,
                "ip_address": log.ip_address,
            }
            for log in logs
        ],
    }


@app.post("/activity-logs")
def create_activity_log(
    log_data: ActivityLogCreate,
    db: Session = Depends(get_db),
):
    allowed_severities = {"Info", "Warning", "Critical"}
    allowed_statuses = {"Success", "Failure"}

    if log_data.severity not in allowed_severities:
        raise HTTPException(status_code=422, detail="Invalid severity")

    if log_data.status not in allowed_statuses:
        raise HTTPException(status_code=422, detail="Invalid status")

    if log_data.user_id is not None:
        user = db.query(models.User).filter(
            models.User.user_id == log_data.user_id
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    new_log = models.ActivityLog(**log_data.model_dump())

    try:
        db.add(new_log)
        db.commit()
        db.refresh(new_log)

        return {
            "message": "Activity log created successfully",
            "item": {
                "log_id": new_log.log_id,
                "timestamp": new_log.timestamp,
                "user_id": new_log.user_id,
                "user_name": new_log.user_name,
                "action": new_log.action,
                "module": new_log.module,
                "severity": new_log.severity,
                "status": new_log.status,
                "details": new_log.details,
                "ip_address": new_log.ip_address,
            },
        }
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not create activity log",
        )


# ==========================================
# 12. VENDOR PERFORMANCE & RELIABILITY API
# ==========================================
@app.post("/vendor-performance/{vendor_id}/calculate", response_model=schemas.VendorPerformanceResponse)
def calculate_vendor_performance(vendor_id: int, db: Session = Depends(get_db)):
    # 1. Total & Completed Orders
    total_orders = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.vendor_id == vendor_id).count()
    completed_orders = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.vendor_id == vendor_id, 
        models.PurchaseOrder.order_status == "Completed"
    ).count()

    # 2. On-Time Delivery & Average Delay
    deliveries = db.query(models.Delivery).filter(models.Delivery.vendor_id == vendor_id).all()
    total_deliveries = len(deliveries)
    on_time_deliveries = sum(1 for d in deliveries if (d.delay_days or 0) <= 0)
    
    on_time_delivery_percentage = (on_time_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0.0
    average_delay_days = sum((d.delay_days or 0) for d in deliveries) / total_deliveries if total_deliveries > 0 else 0.0

    # 3. Quality Score
    inspections = db.query(models.QualityInspection).filter(models.QualityInspection.vendor_id == vendor_id).all()
    total_inspections = len(inspections)
    quality_score_avg = sum((i.quality_score or 0) for i in inspections) / total_inspections if total_inspections > 0 else 0.0

    # 4. Average Response Time
    communications = db.query(models.Communication).filter(models.Communication.vendor_id == vendor_id).all()
    valid_comms = [c for c in communications if c.response_time is not None]
    total_comms = len(valid_comms)
    average_response_time_hours = sum(c.response_time for c in valid_comms) / total_comms if total_comms > 0 else 0.0

    # 5. Reliability Score Calculation
    quality_percentage = quality_score_avg * 10 if quality_score_avg <= 10 else quality_score_avg
    reliability_score = (on_time_delivery_percentage * 0.5) + (quality_percentage * 0.5)
    
    # 6. Risk Level Mapping
    risk_level = "Low"
    if reliability_score < 50:
        risk_level = "High"
    elif reliability_score < 75:
        risk_level = "Medium"

    # 7. Update existing record or Create new
    performance = db.query(models.VendorPerformance).filter(models.VendorPerformance.vendor_id == vendor_id).first()
    
    perf_data = {
        "vendor_id": vendor_id,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "on_time_delivery_percentage": round(on_time_delivery_percentage, 2),
        "average_delay_days": round(average_delay_days, 2),
        "quality_score": round(quality_score_avg, 2),
        "average_response_time_hours": round(average_response_time_hours, 2),
        "reliability_score": round(reliability_score, 2),
        "risk_level": risk_level
    }

    if performance:
        for key, value in perf_data.items():
            setattr(performance, key, value)
    else:
        performance = models.VendorPerformance(**perf_data)
        db.add(performance)
        
    db.commit()
    db.refresh(performance)
    return performance

@app.get("/vendor-performance", response_model=List[schemas.VendorPerformanceResponse])
def get_all_vendor_performances(db: Session = Depends(get_db)):
    return db.query(models.VendorPerformance).all()

# ==========================================
# 13. PROCUREMENT API
# ==========================================
@app.get("/procurements", response_model=List[schemas.ProcurementResponse])
def get_procurements(db: Session = Depends(get_db)):
    return db.query(models.Procurement).all()

@app.post("/procurements", response_model=schemas.ProcurementResponse)
def create_procurement(
    proc: schemas.ProcurementCreate, 
    db: Session = Depends(get_db)
):
    db_proc = models.Procurement(**proc.model_dump())
    db.add(db_proc)
    db.commit()
    db.refresh(db_proc)
    return db_proc

# ==========================================
# 14. CONTRACTS & COMPLIANCE API
# ==========================================
@app.get("/contracts", response_model=List[schemas.ContractResponse])
def get_contracts(db: Session = Depends(get_db)):
    return db.query(models.Contract).all()

@app.post("/contracts", response_model=schemas.ContractResponse)
def create_contract(
    contract: schemas.ContractCreate,
    db: Session = Depends(get_db)
):
    db_contract = models.Contract(**contract.model_dump())
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

@app.put("/contracts/{contract_id}", response_model=schemas.ContractResponse)
def update_contract(
    contract_id: int,
    contract_data: schemas.ContractCreate,
    db: Session = Depends(get_db)
):
    db_contract = db.query(models.Contract).filter(
        models.Contract.contract_id == contract_id
    ).first()

    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    for key, value in contract_data.model_dump(exclude_unset=True).items():
        setattr(db_contract, key, value)

    db.commit()
    db.refresh(db_contract)
    return db_contract

@app.delete("/contracts/{contract_id}")
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    db_contract = db.query(models.Contract).filter(
        models.Contract.contract_id == contract_id
    ).first()

    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    db.delete(db_contract)
    db.commit()
    return {"message": "Contract deleted successfully"}

# ==========================================
# 15. ROLES & PERMISSIONS API
# ==========================================
@app.get("/roles", response_model=List[schemas.RoleResponse])
def get_roles(db: Session = Depends(get_db)):
    return db.query(models.Role).all()

@app.post("/roles", response_model=schemas.RoleResponse)
def create_role(role: schemas.RoleCreate, db: Session = Depends(get_db)):
    db_role = models.Role(**role.model_dump())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@app.put("/roles/{role_id}", response_model=schemas.RoleResponse)
def update_role(
    role_id: int,
    role_data: schemas.RoleCreate,
    db: Session = Depends(get_db)
):
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    for key, value in role_data.model_dump(exclude_unset=True).items():
        setattr(db_role, key, value)
        
    db.commit()
    db.refresh(db_role)
    return db_role

@app.delete("/roles/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    db.delete(db_role)
    db.commit()
    return {"message": "Role deleted successfully"}

# ==========================================
# 16. ACTIVITY LOGS API
# ==========================================
@app.get("/activity-logs", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs(db: Session = Depends(get_db)):
    # .desc() lagaya hai taaki sabse naye logs sabse upar aayein
    return db.query(models.ActivityLog).order_by(models.ActivityLog.id.desc()).all()

@app.post("/activity-logs", response_model=schemas.ActivityLogResponse)
def create_activity_log(log: schemas.ActivityLogCreate, db: Session = Depends(get_db)):
    db_log = models.ActivityLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log