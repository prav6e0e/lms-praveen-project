from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Planner, StudyPlan, Lesson
from schemas import PlannerCreate, PlannerResponse

router = APIRouter(
    prefix="/planner",
    tags=["Planner"]
)


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create")
def create_planner(data: PlannerCreate, db: Session = Depends(get_db)):

    # 🔥 Step 1: All lessons collect from selected courses
    lessons = db.query(Lesson).filter(
        Lesson.course_id.in_(data.course_ids)
    ).all()

    if not lessons:
        raise HTTPException(status_code=404, detail="No lessons found")

    # 🔥 Step 2: Create planner
    planner = Planner(
        user_id=1,   # later JWT
        total_days=data.total_days,
        daily_hours=data.daily_hours
    )

    db.add(planner)
    db.commit()
    db.refresh(planner)

    # 🔥 Step 3: Auto distribute lessons
    total_lessons = len(lessons)
    per_day = max(1, total_lessons // data.total_days)

    day = 1
    count = 0

    for lesson in lessons:
        study = StudyPlan(
            planner_id=planner.id,
            lesson_id=lesson.id,
            day_number=day,
            status="pending"
        )

        db.add(study)

        count += 1
        if count >= per_day and day < data.total_days:
            day += 1
            count = 0

    db.commit()

    return {"planner_id": planner.id}

# ✅ 2. Get All Planners (User Wise)
@router.get("/user/{user_id}", response_model=list[PlannerResponse])
def get_user_planners(user_id: int, db: Session = Depends(get_db)):

    planners = db.query(Planner).filter(
        Planner.user_id == user_id
    ).all()

    if not planners:
        raise HTTPException(status_code=404, detail="No planners found")

    return planners


# ✅ 3. Get Full Study Plan (Day Wise)
@router.get("/{planner_id}/details")
def get_study_plan(planner_id: int, db: Session = Depends(get_db)):

    plan = db.query(StudyPlan).filter(
        StudyPlan.planner_id == planner_id
    ).all()

    if not plan:
        raise HTTPException(status_code=404, detail="No study plan found")

    result = []

    for item in plan:
     result.append({
        "id": item.id,
        "planner_id": item.planner_id,
        "lesson_id": item.lesson_id,
        "day_number": item.day_number,
        "status": item.status,
        "lesson_name": item.lesson.title   # 🔥 yaha se aa raha hai
    })

    return result


# ✅ 4. Mark Lesson as Completed
@router.put("/complete/{study_id}")
def mark_complete(study_id: int, db: Session = Depends(get_db)):

    study = db.query(StudyPlan).filter(
        StudyPlan.id == study_id
    ).first()

    if not study:
        raise HTTPException(status_code=404, detail="Study item not found")

    study.status = "completed"
    db.commit()

    return {"message": "Marked as completed"}


# ✅ 5. Get Active Plans (Incomplete)
@router.get("/user/{user_id}/active")
def get_active_plans(user_id: int, db: Session = Depends(get_db)):
    planners = db.query(Planner).filter(
        Planner.user_id == user_id
    ).all()
    
    result = []
    for planner in planners:
        # Check if plan has incomplete tasks
        incomplete_tasks = db.query(StudyPlan).filter(
            StudyPlan.planner_id == planner.id,
            StudyPlan.status != "completed"
        ).count()
        
        if incomplete_tasks > 0:
            result.append({
                "planner_id": planner.id,
                "total_days": planner.total_days,
                "daily_hours": planner.daily_hours
            })
    
    return result


# ✅ 6. Get Tracked Plans (Completed) with Performance
@router.get("/user/{user_id}/tracked")
def get_tracked_plans(user_id: int, db: Session = Depends(get_db)):
    planners = db.query(Planner).filter(
        Planner.user_id == user_id
    ).all()
    
    result = []
    for planner in planners:
        total_tasks = db.query(StudyPlan).filter(
            StudyPlan.planner_id == planner.id
        ).count()
        
        completed_tasks = db.query(StudyPlan).filter(
            StudyPlan.planner_id == planner.id,
            StudyPlan.status == "completed"
        ).count()
        
        # Only include if all tasks are completed
        if total_tasks > 0 and completed_tasks == total_tasks:
            result.append({
                "planner_id": planner.id,
                "total_days": planner.total_days,
                "daily_hours": planner.daily_hours,
                "total_lessons": total_tasks,
                "completed_lessons": completed_tasks,
                "progress": 100
            })
    
    return result
