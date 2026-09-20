from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
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