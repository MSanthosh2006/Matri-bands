import os
import hmac
import hashlib

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

JWT_SECRET = os.getenv("JWT_SECRET", "")
PIN_PEPPER = os.getenv("PIN_PEPPER", "")

if (
    len(JWT_SECRET) < 32
    or len(PIN_PEPPER) < 32
    or JWT_SECRET.lower().startswith("change-this")
    or PIN_PEPPER.lower().startswith("change-this")
):
    raise RuntimeError(
        "Set unique JWT_SECRET and PIN_PEPPER values (at least 32 characters each) in backend/.env."
    )

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)

def pin_digest(pin):
    return hmac.new(
        PIN_PEPPER.encode(),
        pin.encode(),
        hashlib.sha256
    ).hexdigest()

def create_token(user):
    expiry = datetime.now(timezone.utc) + timedelta(hours=8)

    return jwt.encode(
        {
            "sub": str(user.id),
            "hospital_id": user.hospital_id,
            "role": user.role,
            "exp": expiry
        },
        JWT_SECRET,
        algorithm="HS256"
    )

def get_current_user(
    token: str = Depends(oauth2),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(401, "Invalid session")

    user = db.get(User, user_id)

    if not user or not user.active:
        raise HTTPException(401, "Account unavailable")

    return user

def get_admin(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return user