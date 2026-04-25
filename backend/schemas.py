# pydantic schema matlab data ka blueprint matlab name ho optional ho data type ye sab
from pydantic import BaseModel

# course request ke liye
class CourseCreate(BaseModel):
    name:str
    description:str

# course response ke liye
class CourseResponse(BaseModel):
    id:int
    name:str
    description:str

    class Config:
        from_attributes=True
#__________________________________________________
#user create schema banao
class UserCreate(BaseModel):
    email:str
    password:str
#usewr login schema 
class UserLogin(BaseModel):
    email:str
    password:str
class UserResponse(BaseModel):
    id:int
    email:str

#____________________________________________________
#planner schema
class PlannerBase(BaseModel):
    course_ids:list[int]
    total_days:int
    daily_hours:int
class PlannerCreate(PlannerBase):
    pass

class PlannerResponse(PlannerBase):
    id:int
    user_id:int
    class Config:
        from_attributes=True

#______________________________________________
#studyplan schema
class StudyPlanBase(BaseModel):
    planner_id:int
    lesson_id:int
    day_number:int
    status:str

class StudyPlanCreate(StudyPlanBase):
    pass
class StudyPlanResponse(StudyPlanBase):
    id:int
    planner_id:int
    lesson_id:int
    day_number:int
    status:str
    lesson_name:str

    class Config:
        from_attributes=True

#_______________________________________________
#lesson schema

class LessonBase(BaseModel):
    title:str
    content:str
    course_id:int

class LessonCreate(LessonBase):
    title:str
    content:str
    course_id:int

class LessonResponse(LessonBase):
    id:int

    class Config:
         from_attributes=True


#______________instructor schema________________________________________________________


from typing import Optional, Dict

class InstructorCreate(BaseModel):
    name: str
    email: str
    permissions: Dict = {}

class InstructorResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    permissions: Dict

    class Config:
        from_attributes = True

class InstructorUpdatePermissions(BaseModel):
    permissions: Dict

#_____________________________grievance model___________________________________________________________---

from datetime import datetime

# ➕ CREATE
class GrievanceCreate(BaseModel):
    user_id: int
    subject: str
    message: str


# 📤 RESPONSE
class GrievanceResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# 🔄 UPDATE STATUS
class GrievanceUpdate(BaseModel):
    status: str  # pending / in-progress / resolved

#______________________________DOUBTS STUDY_____________________________________



class DoubtCreate(BaseModel):
    user_id: int
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    question: str
    description: Optional[str] = None


class DoubtResponse(BaseModel):
    id: int
    user_id: int
    course_id: Optional[int]
    lesson_id: Optional[int]
    question: str
    description: Optional[str]
    answer: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DoubtAnswer(BaseModel):
    answer: str

#______________________________________________NOTIFICATIONS_______________________________________________________


# ➕ CREATE
class NotificationCreate(BaseModel):
    title: str
    message: str
    user_id: Optional[int] = None   # null = all users

# 📤 RESPONSE
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    user_id: Optional[int]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

#_____________________________________________PERFORMANCE_____________________________________________________


class PerformanceResponse(BaseModel):
    user_id: int
    active_plans: int
    completed_plans: int
    completion_rate: float

    class Config:
        from_attributes = True