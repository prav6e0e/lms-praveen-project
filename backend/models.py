from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float, func,JSON,Text
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint
from database import Base
from datetime import datetime


#___________________________________________________________________
# Course Model
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    price = Column(Float, default=0.0)
    duration = Column(Integer, default=0)
    instructor_name = Column(String, nullable=True)

    planners = relationship("Planner", back_populates="course")
    lessons = relationship("Lesson", back_populates="course")


#_________________________________________________________
# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String)
    is_active=Column(Boolean,default=True)

    planners = relationship("Planner", back_populates="user")


#___________________________________________________________
# Plan gnerate karega
class Planner(Base):
    __tablename__ = "planners"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)

    total_days = Column(Integer)
    daily_hours = Column(Integer)

    user = relationship("User", back_populates="planners")
    course = relationship("Course", back_populates="planners")
    study_plans = relationship("StudyPlan", back_populates="planner", cascade="all,delete")


#_____________________________________________________________
#generated plan ye hai
class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    planner_id = Column(Integer, ForeignKey("planners.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))

    day_number = Column(Integer)
    hours = Column(Integer)
    status = Column(String, default="pending")

    # 🔥 TIMER FIELDS
    start_time = Column(DateTime, nullable=True)
    time_spent = Column(Integer, default=0)
    is_running = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)

    planner = relationship("Planner", back_populates="study_plans")
    lesson = relationship("Lesson", back_populates="study_plans")


#________________________________________________________________________
# Lesson Model (🔥 MEDIA SUPPORT ADDED)
class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)

    # 🔥 NEW FIELDS
    pdf_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)

    course_id = Column(Integer, ForeignKey("courses.id"))

    course = relationship("Course", back_populates="lessons")
    study_plans = relationship("StudyPlan", back_populates="lesson")


#___________________________________admin model____________________________________
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String)

#_________________________________instructor model table______________________________________________



class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    # 🔥 Permissions stored as JSON
    permissions = Column(JSON, default={})
    # Stats
    courses_count = Column(Integer, default=0)
    lessons_count = Column(Integer, default=0)
    join_date = Column(DateTime, default=datetime.utcnow)

#_____________________________________grievance APP_______________________________________________________


from sqlalchemy.sql import func


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String, nullable=False)
    message = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending / in-progress / resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())

#_____________________________________DOUBTS STUDY___________________________________________________________

class Doubt(Base):
    __tablename__ = "doubts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    course_id = Column(Integer, nullable=True)
    lesson_id = Column(Integer, nullable=True)
    question = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    answer = Column(Text, nullable=True)
    status = Column(String, default="unanswered")
    created_at = Column(DateTime, default=datetime.utcnow)
#___________________________________NOTIFICATIONS___________________________________________________________________


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    message = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null = broadcast
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


#_____________________________________PERFORMANCE__________________________________________________________---



class Performance(Base):
    __tablename__ = "performance"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    active_plans = Column(Integer, default=0)
    completed_plans = Column(Integer, default=0)

    completion_rate = Column(Float, default=0)