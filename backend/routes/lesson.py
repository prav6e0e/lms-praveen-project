from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os

from database import SessionLocal
from models import Lesson
from schemas import LessonCreate

router = APIRouter(
    prefix="/lesson",
    tags=["Lesson"]
)

# ---------------- DB ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- CREATE LESSON ----------------
@router.post("/create")
def create_lesson(data: LessonCreate, db: Session = Depends(get_db)):

    lesson = Lesson(
        title=data.title,
        content=data.content,
        course_id=data.course_id
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return {
        "message": "Lesson created",
        "lesson_id": lesson.id
    }

# ---------------- GET ALL LESSONS ----------------
@router.get("/course/{course_id}/lessons")
def get_lessons(course_id: int, db: Session = Depends(get_db)):
    return db.query(Lesson).filter(Lesson.course_id == course_id).all()

# ---------------- GET SINGLE LESSON ----------------
@router.get("/{lesson_id}")
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return lesson

# ---------------- DELETE LESSON ----------------
@router.delete("/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    db.delete(lesson)
    db.commit()

    return {"message": "Lesson deleted successfully"}

# ---------------- UPLOAD MEDIA ----------------
@router.post("/upload-media/{id}")
def upload_media(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    lesson = db.query(Lesson).filter(Lesson.id == id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # ✅ ensure folder exists
    os.makedirs("media", exist_ok=True)

    filename = file.filename.lower()
    file_location = f"media/{file.filename}"

    with open(file_location, "wb") as f:
        f.write(file.file.read())

    # ---------------- TYPE DETECTION ----------------
    if filename.endswith(".pdf"):
        lesson.pdf_url = file_location

    elif filename.endswith((".mp4", ".mpeg", ".mov", ".avi")):
        lesson.video_url = file_location

    elif filename.endswith((".mp3", ".wav")):
        lesson.audio_url = file_location

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    db.commit()
    db.refresh(lesson)

    return {
        "message": "File uploaded successfully",
        "pdf_url": lesson.pdf_url,
        "video_url": lesson.video_url,
        "audio_url": lesson.audio_url
    }