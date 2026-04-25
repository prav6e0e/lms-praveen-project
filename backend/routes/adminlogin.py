from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Admin
from auth import verify_password
from auth import create_token

router = APIRouter()


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.post("/admin/login")
def admin_login(email: str, password: str, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == email).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    if not verify_password(password, admin.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    token = create_token({
        "sub": admin.email,
        "role": "admin"   # 🔥 IMPORTANT
    })

    return {
        "message": "Admin login successful",
        "access_token": token
    }