from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Course
from schemas import CourseCreate,CourseResponse

router=APIRouter()


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/courses")
def get_courses(db:Session=Depends(get_db)):
    return db.query(Course).all()

#______________________________________________________
#protected route token required

from fastapi import Request
def get_current_user(request:Request):
    token=request.headers.get("Authorization")
    return {"token":token}


@router.get("/protected")
def protected(user=Depends(get_current_user)):
    return {"your are authorized user":user}