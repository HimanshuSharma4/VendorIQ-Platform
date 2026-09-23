from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from passlib.context import CryptContext

from . import models, schemas, auth
from .database import engine, get_db

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database tables create karna
models.Base.metadata.create_all(bind=engine)

# FastAPI app initialize karna
app = FastAPI(title="VendorIQ API")

# --- CORS Middleware Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"], # Angular frontend allowed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------------------

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@app.get("/")
def read_root():
    return {"message": "VendorIQ Platform API is running!"}

@app.post("/users/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check agar email pehle se exist karti hai
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Password hash karke database me save karna
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/users/login", response_model=schemas.Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Check karein ki user database me hai ya nahi
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # Agar user nahi mila ya password match nahi hua
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # JWT Token generate karna
    token_data = {"sub": db_user.email, "role": db_user.role}
    access_token = auth.create_access_token(data=token_data)
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Secure Vendor APIs (Database Connected) ---

@app.post("/vendors", response_model=schemas.VendorResponse)
def create_vendor(
    vendor: schemas.VendorCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Creates a new vendor in the database. Secure endpoint.
    """
    new_vendor = models.Vendor(
        vendor_name=vendor.vendor_name,
        category=vendor.category,
        status=vendor.status
    )
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor

@app.get("/vendors")
def get_vendors(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retrieves all vendors from the database. Secure endpoint.
    """
    vendors = db.query(models.Vendor).all()
    
    # Frontend table me column ka naam 'vendor_id' hai, isliye hum DB ke 'id' ko map kar rahe hain
    return [{
        "vendor_id": v.id, 
        "vendor_name": v.vendor_name, 
        "category": v.category, 
        "status": v.status
    } for v in vendors]

@app.put("/vendors/{vendor_id}")
def update_vendor(
    vendor_id: int, 
    vendor_data: schemas.VendorCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Updates an existing vendor in the database. Secure endpoint.
    """
    # 1. Pehle database me vendor ko uski 'id' se dhoondho
    db_vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # 2. Naya data update karo
    db_vendor.vendor_name = vendor_data.vendor_name
    db_vendor.category = vendor_data.category
    db_vendor.status = vendor_data.status
    
    # 3. Database me save karo
    db.commit()
    db.refresh(db_vendor)
    
    # Wapas wahi structure return karo jo frontend table ko chahiye
    return {
        "vendor_id": db_vendor.id, 
        "vendor_name": db_vendor.vendor_name, 
        "category": db_vendor.category, 
        "status": db_vendor.status
    }

@app.delete("/vendors/{vendor_id}")
def delete_vendor(
    vendor_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deletes a vendor from the database. Secure endpoint.
    """
    # 1. Pehle vendor ko dhoondho
    db_vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # 2. Database se delete karo
    db.delete(db_vendor)
    db.commit()
    return {"message": "Vendor deleted successfully"}

# ==========================================
# PURCHASE ORDERS APIs (Procurement Module)
# ==========================================

@app.post("/purchase-orders", response_model=schemas.PurchaseOrderResponse)
def create_purchase_order(
    po: schemas.PurchaseOrderCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Creates a new Purchase Order in the database.
    """
    # 1. Check karo ki Vendor exist karta hai ya nahi
    db_vendor = db.query(models.Vendor).filter(models.Vendor.id == po.vendor_id).first()
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    # 2. Check karo ki PO Number pehle se toh nahi hai
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.po_number == po.po_number).first()
    if db_po:
        raise HTTPException(status_code=400, detail="PO Number already exists")

    new_po = models.PurchaseOrder(
        po_number=po.po_number,
        vendor_id=po.vendor_id,
        total_amount=po.total_amount,
        status=po.status
    )
    db.add(new_po)
    db.commit()
    db.refresh(new_po)
    return new_po

@app.get("/purchase-orders")
def get_purchase_orders(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retrieves all Purchase Orders from the database.
    """
    # Isme hum Vendor ki details bhi sath me bhej rahe hain taaki frontend me vendor ka naam dikh sake
    pos = db.query(models.PurchaseOrder).all()
    
    result = []
    for po in pos:
        result.append({
            "id": po.id,
            "po_number": po.po_number,
            "vendor_id": po.vendor_id,
            "vendor_name": po.vendor.vendor_name if po.vendor else "Unknown", # Relationship ka fayda!
            "order_date": po.order_date,
            "total_amount": po.total_amount,
            "status": po.status
        })
    return result

@app.delete("/purchase-orders/{po_id}")
def delete_purchase_order(
    po_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deletes a Purchase Order.
    """
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    db.delete(db_po)
    db.commit()
    return {"message": "Purchase Order deleted successfully"}

# ==========================================
# DASHBOARD ANALYTICS API
# ==========================================

@app.get("/analytics")
def get_dashboard_analytics(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Calculates real-time metrics for the main dashboard statistics.
    """
    # 1. Total Vendors
    total_vendors = db.query(models.Vendor).count()
    
    # 2. Active Vendors
    active_vendors = db.query(models.Vendor).filter(models.Vendor.status == "Active").count()
    
    # 3. Total Purchase Orders
    total_pos = db.query(models.PurchaseOrder).count()
    
    # 4. Total Approved Spend (Amount)
    approved_spend = db.query(func.sum(models.PurchaseOrder.total_amount))\
                       .filter(models.PurchaseOrder.status == "Approved")\
                       .scalar() or 0.0

    return {
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "total_purchase_orders": total_pos,
        "total_approved_spend": approved_spend
    }

# ==========================================
# CONTRACTS & COMPLIANCE API
# ==========================================
@app.get("/contracts", response_model=list[schemas.ContractResponse])
def get_contracts(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Contract).all()

@app.post("/contracts", response_model=schemas.ContractResponse)
def create_contract(
    contract: schemas.ContractCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    new_contract = models.Contract(**contract.dict())
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)
    return new_contract

@app.delete("/contracts/{contract_id}")
def delete_contract(
    contract_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    contract = db.query(models.Contract).filter(models.Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    db.delete(contract)
    db.commit()
    return {"message": "Contract deleted successfully"}

# ==========================================
# USER MANAGEMENT API
# ==========================================
@app.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id, 
            "username": u.email, 
            "role": getattr(u, 'role', 'User'), 
            "is_active": u.is_active
        } 
        for u in users
    ]

@app.post("/users")
def add_new_user(user_data: dict, db: Session = Depends(get_db)):
    hashed_pw = pwd_context.hash(user_data["password"])
    
    new_user = models.User(
        email=user_data["username"], 
        hashed_password=hashed_pw, 
        role=user_data["role"], 
        is_active=True
    )
    
    try:
        db.add(new_user)
        db.commit()
        return {"message": "User created successfully"}
    except IntegrityError:
        # Agar user pehle se hai, toh database transaction ko rollback karo aur error bhejo
        db.rollback()
        raise HTTPException(status_code=400, detail="Username already exists in the system")