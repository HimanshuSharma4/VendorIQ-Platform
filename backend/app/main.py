from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List

from . import models, schemas
from .database import engine, get_db

# Tables create karne ke liye
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="VendorIQ Reliability Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

# ==========================================
# 1. USERS API & AUTH
# ==========================================
@app.post("/users/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/users/login")
def login_json(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": user.email, "token_type": "bearer"}

@app.post("/token")
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or user.password != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": user.email, "token_type": "bearer"}

# ==========================================
# 2. VENDORS API (Create, Read, Update, Delete)
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
def update_vendor(vendor_id: int, vendor_data: schemas.VendorCreate, db: Session = Depends(get_db)):
    db_vendor = db.query(models.Vendor).filter(models.Vendor.vendor_id == vendor_id).first()
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    for key, value in vendor_data.model_dump(exclude_unset=True).items():
        setattr(db_vendor, key, value)
        
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@app.delete("/vendors/{vendor_id}")
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    db_vendor = db.query(models.Vendor).filter(models.Vendor.vendor_id == vendor_id).first()
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
def update_product(product_id: int, product_data: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.model_dump(exclude_unset=True).items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
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
def create_purchase_order(po: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    db_po = models.PurchaseOrder(**po.model_dump())
    db.add(db_po)
    db.commit()
    db.refresh(db_po)
    return db_po

@app.put("/purchase-orders/{po_id}", response_model=schemas.PurchaseOrderResponse)
def update_purchase_order(po_id: int, po_data: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.po_id == po_id).first()
    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    for key, value in po_data.model_dump(exclude_unset=True).items():
        setattr(db_po, key, value)
        
    db.commit()
    db.refresh(db_po)
    return db_po

@app.delete("/purchase-orders/{po_id}")
def delete_purchase_order(po_id: int, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.po_id == po_id).first()
    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    db.delete(db_po)
    db.commit()
    return {"message": "Purchase Order deleted successfully"}

# ==========================================
# 5. DELIVERIES API (New Module)
# ==========================================
@app.get("/deliveries", response_model=List[schemas.DeliveryResponse])
def get_deliveries(db: Session = Depends(get_db)):
    return db.query(models.Delivery).all()

@app.post("/deliveries", response_model=schemas.DeliveryResponse)
def create_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    db_delivery = models.Delivery(**delivery.model_dump())
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@app.put("/deliveries/{delivery_id}", response_model=schemas.DeliveryResponse)
def update_delivery(delivery_id: int, delivery_data: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.delivery_id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    for key, value in delivery_data.model_dump(exclude_unset=True).items():
        setattr(db_delivery, key, value)
        
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@app.delete("/deliveries/{delivery_id}")
def delete_delivery(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.delivery_id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    db.delete(db_delivery)
    db.commit()
    return {"message": "Delivery deleted successfully"}

# ==========================================
# 6. INVOICES API (New Module)
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
def update_invoice(invoice_id: int, invoice_data: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    for key, value in invoice_data.model_dump(exclude_unset=True).items():
        setattr(db_invoice, key, value)
        
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(db_invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}

# ==========================================
# 7. QUALITY INSPECTION API
# ==========================================
@app.get("/quality-inspections", response_model=List[schemas.QualityInspectionResponse])
def get_quality_inspections(db: Session = Depends(get_db)):
    return db.query(models.QualityInspection).all()

@app.post("/quality-inspections", response_model=schemas.QualityInspectionResponse)
def create_quality_inspection(inspection: schemas.QualityInspectionCreate, db: Session = Depends(get_db)):
    db_inspection = models.QualityInspection(**inspection.model_dump())
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

@app.put("/quality-inspections/{inspection_id}", response_model=schemas.QualityInspectionResponse)
def update_quality_inspection(inspection_id: int, inspection_data: schemas.QualityInspectionCreate, db: Session = Depends(get_db)):
    db_inspection = db.query(models.QualityInspection).filter(models.QualityInspection.inspection_id == inspection_id).first()
    if not db_inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    for key, value in inspection_data.model_dump(exclude_unset=True).items():
        setattr(db_inspection, key, value)
        
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

@app.delete("/quality-inspections/{inspection_id}")
def delete_quality_inspection(inspection_id: int, db: Session = Depends(get_db)):
    db_inspection = db.query(models.QualityInspection).filter(models.QualityInspection.inspection_id == inspection_id).first()
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
def create_communication(comm: schemas.CommunicationCreate, db: Session = Depends(get_db)):
    db_comm = models.Communication(**comm.model_dump())
    db.add(db_comm)
    db.commit()
    db.refresh(db_comm)
    return db_comm

@app.put("/communications/{communication_id}", response_model=schemas.CommunicationResponse)
def update_communication(communication_id: int, comm_data: schemas.CommunicationCreate, db: Session = Depends(get_db)):
    db_comm = db.query(models.Communication).filter(models.Communication.communication_id == communication_id).first()
    if not db_comm:
        raise HTTPException(status_code=404, detail="Record not found")
    
    for key, value in comm_data.model_dump(exclude_unset=True).items():
        setattr(db_comm, key, value)
        
    db.commit()
    db.refresh(db_comm)
    return db_comm

@app.delete("/communications/{communication_id}")
def delete_communication(communication_id: int, db: Session = Depends(get_db)):
    db_comm = db.query(models.Communication).filter(models.Communication.communication_id == communication_id).first()
    if not db_comm:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(db_comm)
    db.commit()
    return {"message": "Record deleted successfully"}

# ==========================================
# 6. DASHBOARD ANALYTICS API
# ==========================================
@app.get("/analytics")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    total_vendors = db.query(models.Vendor).count()
    active_vendors = db.query(models.Vendor).filter(models.Vendor.status == "Active").count()
    total_pos = db.query(models.PurchaseOrder).count()
    
    approved_spend = db.query(func.sum(models.PurchaseOrder.total_amount))\
        .filter(models.PurchaseOrder.order_status == "Approved").scalar() or 0.0

    return {
        "totalVendors": total_vendors,
        "activeVendors": active_vendors,
        "totalPurchaseOrders": total_pos,
        "approvedSpend": approved_spend,
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "total_purchase_orders": total_pos,
        "approved_spend": approved_spend
    }