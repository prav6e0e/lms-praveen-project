from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Planner, Course, StudyPlan, Lesson
from auth import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)



def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = current_user.id

    courses = db.query(Course).all()
    result = []

    for course in courses:

        planner = db.query(Planner).filter(
            Planner.user_id == user_id,
            Planner.course_id == course.id
        ).first()

        if planner:

            study_plans = db.query(StudyPlan).filter(
                StudyPlan.planner_id == planner.id
            ).all()

            total = len(study_plans)
            completed = len([s for s in study_plans if s.status == "completed"])

            progress = (completed / total * 100) if total > 0 else 0

            result.append({
                "planner_id": planner.id,
                "course": {
                    "id": course.id,
                    "name": course.name,
                    "description": course.description
                },
                "total_days": planner.total_days,
                "daily_hours": planner.daily_hours,
                "progress": round(progress, 2),
                "total_lessons": total,
                "completed_lessons": completed
            })

        else:
            result.append({
                "planner_id": None,
                "course": {
                    "id": course.id,
                    "name": course.name,
                    "description": course.description
                },
                "total_days": None,
                "daily_hours": None,
                "progress": 0,
                "total_lessons": 0,
                "completed_lessons": 0
            })

    return result