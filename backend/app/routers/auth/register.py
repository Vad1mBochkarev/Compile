from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.schemas import UserCreate, UserResponse
from app.models.models import User
from app.utils.database import get_db
from app.services.auth_service import AuthService

router = APIRouter(prefix="/register", tags=["Authentication"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    auth_service = AuthService(db)
    return auth_service.register(data)