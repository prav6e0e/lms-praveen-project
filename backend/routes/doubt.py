from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Doubt
from schemas import DoubtCreate, DoubtResponse, DoubtAnswer

router = APIRouter()

# DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ➕ CREATE DOUBT (Student)
@router.post("/doubts", response_model=DoubtResponse)
def create_doubt(data: DoubtCreate, db: Session = Depends(get_db)):
    doubt = Doubt(**data.dict())
    db.add(doubt)
    db.commit()
    db.refresh(doubt)
    return doubt


# 📋 GET ALL DOUBTS (Admin)
@router.get("/doubts", response_model=list[DoubtResponse])
def get_doubts(db: Session = Depends(get_db)):
    return db.query(Doubt).order_by(Doubt.created_at.desc()).all()


# 👤 GET USER DOUBTS
@router.get("/doubts/user/{user_id}", response_model=list[DoubtResponse])
def get_user_doubts(user_id: int, db: Session = Depends(get_db)):
    return db.query(Doubt).filter(Doubt.user_id == user_id).all()


# ✏️ ANSWER DOUBT (Admin / Instructor)
@router.put("/doubts/{id}/answer")
def answer_doubt(id: int, data: DoubtAnswer, db: Session = Depends(get_db)):
    doubt = db.query(Doubt).filter(Doubt.id == id).first()

    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")

    doubt.answer = data.answer
    doubt.status = "answered"
    db.commit()

    return {"message": "Answer submitted successfully"}


# ❌ DELETE DOUBT
@router.delete("/doubts/{id}")
def delete_doubt(id: int, db: Session = Depends(get_db)):
    doubt = db.query(Doubt).filter(Doubt.id == id).first()

    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")

    db.delete(doubt)
    db.commit()

    return {"message": "Doubt deleted"}