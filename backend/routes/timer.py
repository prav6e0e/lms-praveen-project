from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from database import SessionLocal
from models import StudyPlan

router = APIRouter()


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/start/{id}")
def start_lesson(id: int, db: Session = Depends(get_db)):
    lesson = db.query(StudyPlan).filter(StudyPlan.id == id).first()

    if not lesson:
        return {"error":"plan not found"}


    lesson.start_time = datetime.utcnow()
    lesson.is_running = True

    db.commit()
    return {"message": "Started"}

@router.post("/pause/{id}")
def pause_lesson(id: int, db: Session = Depends(get_db)):
    lesson = db.query(StudyPlan).filter(StudyPlan.id == id).first()

    
    if not lesson:
        return {"error":"plan not found"}

    if lesson.start_time:
        diff = (datetime.utcnow() - lesson.start_time).seconds
        lesson.time_spent += diff

    lesson.start_time = None
    lesson.is_running = False

    db.commit()
    return {"message": "Paused"}

@router.post("/resume/{id}")
def resume_lesson(id: int, db: Session = Depends(get_db)):
    lesson = db.query(StudyPlan).filter(StudyPlan.id == id).first()

    
    if not lesson:
        return {"error":"plan not found"}

    lesson.start_time = datetime.utcnow()
    lesson.is_running = True

    db.commit()
    return {"message": "Resumed"}