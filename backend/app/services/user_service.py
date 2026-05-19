from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.models import User, UserProfile
from app.schemas.schemas import UserProfileUpdate, UserProfileResponse, UserResponse


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_username(self, username: str) -> UserResponse:
        """Получение пользователя по email (username)"""
        user = self.db.query(User).filter(User.email == username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден"
            )
        return UserResponse.model_validate(user)

    def get_user_with_profile(self, user_id: str) -> dict:
        """Получение пользователя с профилем"""
        from uuid import UUID
        user = self.db.query(User).filter(User.id == UUID(user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден"
            )
        return user

    def update_profile(self, user: User, data: UserProfileUpdate) -> UserProfileResponse:
        """Обновление профиля пользователя"""
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

        if not profile:
            # Создаём профиль если его нет
            profile = UserProfile(user_id=user.id)
            self.db.add(profile)
            self.db.flush()

        # Обновляем поля
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)

        self.db.commit()
        self.db.refresh(profile)

        return UserProfileResponse.model_validate(profile)

    def get_profile(self, user: User) -> Optional[UserProfileResponse]:
        """Получение профиля пользователя"""
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if not profile:
            return None
        return UserProfileResponse.model_validate(profile)