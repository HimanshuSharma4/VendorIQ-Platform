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