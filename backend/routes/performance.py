from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import StudyPlan
from schemas import PerformanceResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 📊 GET PERFORMANCE
@router.get("/performance", response_model=list[PerformanceResponse])
def get_performance(db: Session = Depends(get_db)):

    users = db.query(StudyPlan.user_id).distinct().all()

    result = []

    for u in users:
        user_id = u[0]

        active = db.query(StudyPlan).filter(
            StudyPlan.user_id == user_id,
            StudyPlan.status == "pending"
        ).count()

        completed = db.query(StudyPlan).filter(
            StudyPlan.user_id == user_id,
            StudyPlan.status == "completed"
        ).count()

        total = active + completed

        completion_rate = (completed / total * 100) if total > 0 else 0

        result.append({
            "user_id": user_id,
            "active_plans": active,
            "completed_plans": completed,
            "completion_rate": round(completion_rate, 2)
        })

    return result