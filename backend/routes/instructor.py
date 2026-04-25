from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Instructor
from schemas import InstructorCreate, InstructorResponse, InstructorUpdatePermissions

router = APIRouter()

# DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ CREATE INSTRUCTOR
@router.post("/instructors", response_model=InstructorResponse)
def create_instructor(data: InstructorCreate, db: Session = Depends(get_db)):
    instructor = Instructor(**data.dict())
    db.add(instructor)
    db.commit()
    db.refresh(instructor)
    return instructor

# 📋 GET ALL INSTRUCTORS
@router.get("/instructors", response_model=list[InstructorResponse])
def get_instructors(db: Session = Depends(get_db)):
    return db.query(Instructor).all()

# 🔐 UPDATE PERMISSIONS
@router.put("/instructors/{id}/permissions")
def update_permissions(id: int, data: InstructorUpdatePermissions, db: Session = Depends(get_db)):
    instructor = db.query(Instructor).filter(Instructor.id == id).first()
    
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    instructor.permissions = data.permissions
    db.commit()

    return {"message": "Permissions updated"}

# 🚫 BLOCK INSTRUCTOR
@router.put("/instructors/block/{id}")
def block_instructor(id: int, db: Session = Depends(get_db)):
    instructor = db.query(Instructor).filter(Instructor.id == id).first()
    
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    instructor.is_active = False
    db.commit()

    return {"message": "Instructor blocked"}

# ✅ UNBLOCK INSTRUCTOR
@router.put("/instructors/unblock/{id}")
def unblock_instructor(id: int, db: Session = Depends(get_db)):
    instructor = db.query(Instructor).filter(Instructor.id == id).first()
    
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    instructor.is_active = True
    db.commit()

    return {"message": "Instructor unblocked"}

# ❌ DELETE INSTRUCTOR
@router.delete("/instructors/{id}")
def delete_instructor(id: int, db: Session = Depends(get_db)):
    instructor = db.query(Instructor).filter(Instructor.id == id).first()
    
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    db.delete(instructor)
    db.commit()

    return {"message": "Instructor deleted"}