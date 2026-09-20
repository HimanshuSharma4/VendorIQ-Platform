from pydantic import BaseModel, EmailStr

# Ye class batati hai ki User register karte waqt kya data bhejega
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "VENDOR"

# Ye class batati hai ki API response me user ko wapas kya dikhega (password hide kar denge)
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

# Frontend se naya vendor banate waqt ye data aayega
class VendorCreate(BaseModel):
    vendor_name: str
    category: str
    status: str = "Active"

# Backend se API response me (jaise dashboard par) ye data aayega
class VendorResponse(BaseModel):
    id: int
    vendor_name: str
    category: str
    status: str

    class Config:
        from_attributes = True # SQLAlchemy object ko JSON me convert karne ke liye zaroori hai