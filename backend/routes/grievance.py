from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Grievance
from schemas import GrievanceCreate, GrievanceResponse, GrievanceUpdate

router = APIRouter()

# DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ➕ CREATE GRIEVANCE (Student)
@router.post("/grievances", response_model=GrievanceResponse)
def create_grievance(data: GrievanceCreate, db: Session = Depends(get_db)):
    grievance = Grievance(**data.dict())
    db.add(grievance)
    db.commit()
    db.refresh(grievance)
    return grievance


# 📋 GET ALL (Admin)
@router.get("/grievances", response_model=list[GrievanceResponse])
def get_grievances(db: Session = Depends(get_db)):
    return db.query(Grievance).order_by(Grievance.created_at.desc()).all()


# 👤 GET USER GRIEVANCES
@router.get("/grievances/user/{user_id}", response_model=list[GrievanceResponse])
def get_user_grievances(user_id: int, db: Session = Depends(get_db)):
    return db.query(Grievance).filter(Grievance.user_id == user_id).all()


# 🔄 UPDATE STATUS (Admin)
@router.put("/grievances/{id}")
def update_grievance(id: int, data: GrievanceUpdate, db: Session = Depends(get_db)):
    grievance = db.query(Grievance).filter(Grievance.id == id).first()

    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    grievance.status = data.status
    db.commit()

    return {"message": "Status updated"}


# ❌ DELETE
@router.delete("/grievances/{id}")
def delete_grievance(id: int, db: Session = Depends(get_db)):
    grievance = db.query(Grievance).filter(Grievance.id == id).first()

    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    db.delete(grievance)
    db.commit()

    return {"message": "Deleted successfully"}