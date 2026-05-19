from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.schemas import LoginRequest, TokenResponse
from app.utils.database import get_db
from app.services.auth_service import AuthService

router = APIRouter(prefix="/login", tags=["Authentication"])


@router.post("/")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Вход в аккаунт"""
    auth_service = AuthService(db)
    return auth_service.login(data)