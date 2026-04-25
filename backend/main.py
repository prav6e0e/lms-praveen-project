from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
#_______________________________________
#DB ko main file me connect karo
from database import engine
from models import Base

app=FastAPI()

#_______________________________________
#add CORS Middleware FIRST (before any mounts or routes)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:5173"],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"],
                   )

app.mount("/media",
          StaticFiles(directory="media"),
          name="media")

#__________________________________________________________
#table automatically create karega
Base.metadata.create_all(bind=engine)
#____________________________________
@app.get("/")
def home():
    return {"API is running"}


#_________________________________________________
#database session 
from fastapi import Depends
from sqlalchemy.orm import Session
from database import SessionLocal

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

#________________________________________________
#course add api
from models import Course


#____________________________________________________________
#delete api
#delete course anyone 
@app.delete("/courses/{course_id}")
def delete_course(course_id:int,db:Session=Depends(get_db)):
    course=db.query(Course).filter(Course.id==course_id).first()

    if not course:
        return {"ERROR:Course not found"}
    
    db.delete(course)
    db.commit()

    return {"Course Deleted"}

#_________________________________________________________________
#schemas ko main.py main add karo
#create api 

from schemas import CourseCreate,CourseResponse
#create api me status code add karo
from fastapi import status
@app.post("/courses",response_model=CourseResponse,status_code=status.HTTP_201_CREATED)
def create_course(course:CourseCreate,db:Session=Depends(get_db)):
    new_course=Course(name=course.name,description=course.description)

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course
#__________________________________________________________________________
#read api
from typing import List
@app.get("/courses",response_model=List[CourseResponse])
def get_courses(db:Session=Depends(get_db)):
    return db.query(Course).all()
#isse ab data json format me jaega course ka matlab ab validation lag gaya ki string hi hai etc
#main.py me get post  ka ek ek url hi hoga ok 

#________________________________________________________________________________
#update api
from fastapi import HTTPException
#ye url hai
@app.put("/courses/{course_id}")
#ye function hai url me
def update_course(course_id:int,updated_course:CourseCreate,db:Session=Depends(get_db)):
    course=db.query(Course).filter(Course.id==course_id).first()

    if not course:
        raise HTTPException(status_code=404,detail="course not found")
    
    course.name=updated_course.name
    course.description=updated_course.description

    db.commit()
    db.refresh(course)
    return course
#_____________________admin default create auto_____________________________________________________________________


from models import Admin
from auth import hash_password

def create_default_admin():
    db: Session = SessionLocal()

    admin = db.query(Admin).filter(Admin.email == "admin@gmail.com").first()

    if not admin:
        new_admin = Admin(
            email="admin@gmail.com",
            password=hash_password("admin123")
        )
        db.add(new_admin)
        db.commit()

    db.close()

create_default_admin()

#__________________________________________________________________________________
#routes ko main.py me connect karo

from routes import user,course,planner,lesson,dashboard,timer,adminlogin,instructor,grievance,doubt,notification,performance
app.include_router(user.router)
app.include_router(course.router)
app.include_router(planner.router)
app.include_router(lesson.router)
app.include_router(dashboard.router)
app.include_router(timer.router)
app.include_router(adminlogin.router)
app.include_router(instructor.router)
app.include_router(grievance.router)
app.include_router(doubt.router)
app.include_router(notification.router)
app.include_router(performance.router)



