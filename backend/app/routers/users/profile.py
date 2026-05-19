from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.schemas import UserResponse, UserProfileResponse, UserProfileUpdate
from app.models.models import User
from app.utils.database import get_db
from app.dependencies import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=dict)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получение профиля текущего пользователя с профилем"""
    user_service = UserService(db)
    profile = user_service.get_profile(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "profile": profile,
    }


@router.get("/{username}", response_model=UserResponse)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    """Получение профиля пользователя по email"""
    user_service = UserService(db)
    return user_service.get_by_username(username)


@router.put("/me", response_model=UserProfileResponse)
def update_current_user_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновление профиля текущего пользователя"""
    user_service = UserService(db)
    return user_service.update_profile(current_user, data)