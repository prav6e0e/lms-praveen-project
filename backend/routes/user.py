#signup api

from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate
from database import SessionLocal
from auth import hash_password


router=APIRouter(prefix="/user",tags=["User"])


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup")
def signup(user:UserCreate,db:Session=Depends(get_db)):
    existing_user=db.query(User).filter(User.email==user.email).first()
    if existing_user:
        raise HTTPException(status_code=400,detail="EMail already exist")
    
    hashed=hash_password(user.password)
    new_user=User(email=user.email,password=hashed)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"user created"}

#_______________________________________________________________
#login api
from fastapi import HTTPException
from schemas import UserLogin
from auth import verify_password,create_token

@router.post("/login")
def login(user:UserLogin,db:Session=Depends(get_db)):
    db_user=db.query(User).filter(User.email==user.email).first()

    if not db_user:
        raise HTTPException(status_code=404,detail="user not found")
    
    if not verify_password(user.password,db_user.password):
        raise HTTPException(status_code=401,detail="invalid password")
    
    token=create_token({"user_id":db_user.id})
    
    return {"access_token":token,
            "token_type":"bearer",
            "user_id":db_user.id}
#_____________________________________get users_____________________________
@router.get("/admin/users")
def get_users(db:Session=Depends(get_db)):
    return db.query(User).all()


#_______________________________delete user api__________________________________________

@router.delete("/admin/user/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

#___________________________________________user block___________________________________---
@router.put("/admin/user/block/{id}")
def block_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    user.is_active = False
    db.commit()
    return {"message": "User blocked"}
#_____________________________unblock____________________________________________
@router.put("/admin/user/unblock/{id}")
def unblock_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()

    return {"message": "User unblocked"}

#_______________________________________user performance_______________________________------
@router.get("/performance")
def user_performance(db: Session = Depends(get_db)):
    return [
        {"name": "User1", "progress": 80},
        {"name": "User2", "progress": 50},
        {"name": "User3", "progress": 90}
    ]
  