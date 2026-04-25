from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Notification
from schemas import NotificationCreate, NotificationResponse

router = APIRouter()

# DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ➕ CREATE (ADMIN)
@router.post("/notifications", response_model=NotificationResponse)
def create_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    notification = Notification(**data.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


# 📋 GET ALL (ADMIN)
@router.get("/notifications", response_model=list[NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()


# 👤 GET USER NOTIFICATIONS
@router.get("/notifications/user/{user_id}", response_model=list[NotificationResponse])
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    return db.query(Notification).filter(
        (Notification.user_id == user_id) | (Notification.user_id == None)
    ).order_by(Notification.created_at.desc()).all()


# ✅ MARK AS READ
@router.put("/notifications/read/{id}")
def mark_as_read(id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == id).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()

    return {"message": "Marked as read"}


# ❌ DELETE
@router.delete("/notifications/{id}")
def delete_notification(id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == id).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()

    return {"message": "Deleted successfully"}