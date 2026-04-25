#password hashing

from passlib.context import CryptContext

pwd_context=CryptContext(schemes=["argon2"],deprecated="auto")

def hash_password(password:str):
    return pwd_context.hash(password)

def verify_password(plain,hashed):
    return pwd_context.verify(plain,hashed)
#__________________________________________________________________
#jwt token
from jose import JWTError,jwt
from datetime import datetime ,timedelta

SECRET_KEY="mysecret"
ALGORITHM="HS256"

def create_token(data:dict):
    to_encode=data.copy()
    expire=datetime.utcnow()+timedelta(hours=1)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

#___________________________________________________________________________
#get current user
from fastapi import Depends,HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/user/login")




def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token error")

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user