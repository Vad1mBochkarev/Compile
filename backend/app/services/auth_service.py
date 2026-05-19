import bcrypt
from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.models.models import User, UserProfile
from app.schemas.schemas import UserCreate, LoginRequest, TokenResponse, UserResponse
from app.config import settings


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def _hash_password(self, password: str) -> str:
        """Хеширование пароля"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Проверка пароля"""
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)

    def _create_access_token(self, user_id: UUID) -> str:
        """Создание access токена"""
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": str(user_id), "exp": expire, "type": "access"}
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def _create_refresh_token(self, user_id: UUID) -> str:
        """Создание refresh токена"""
        expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def _decode_token(self, token: str, token_type: str = "access") -> Optional[UUID]:
        """Декодирование JWT токена"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            if payload.get("type") != token_type:
                return None
            user_id = payload.get("sub")
            if user_id is None:
                return None
            return UUID(user_id)
        except JWTError:
            return None

    def register(self, data: UserCreate) -> UserResponse:
        """Регистрация нового пользователя"""
        # Проверка на существующего пользователя
        existing = self.db.query(User).filter(User.email == data.email).first()
        if existing:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует"
            )

        # Создание пользователя
        user = User(
            email=data.email,
            password_hash=self._hash_password(data.password),
        )
        self.db.add(user)
        self.db.flush()

        # Создание профиля
        profile = UserProfile(user_id=user.id)
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(user)
        self.db.refresh(profile)

        return UserResponse.model_validate(user, from_attributes=True)

    def login(self, data: LoginRequest) -> TokenResponse:
        """Вход в аккаунт"""
        user = self.db.query(User).filter(User.email == data.email).first()
        if not user or not self._verify_password(data.password, user.password_hash):
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль"
            )

        if not user.is_active:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Аккаунт заблокирован"
            )

        access_token = self._create_access_token(user.id)
        refresh_token = self._create_refresh_token(user.id)

        # Сохраняем refresh токен в БД (для возможности отзыва)
        # В простой версии просто возвращаем токены
        return TokenResponse(access_token=access_token, token_type="bearer", refresh_token=refresh_token)

    def refresh_token(self, refresh_token: str) -> TokenResponse:
        """Обновление access токена"""
        user_id = self._decode_token(refresh_token, token_type="refresh")
        if not user_id:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный refresh токен"
            )

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден или заблокирован"
            )

        access_token = self._create_access_token(user.id)
        new_refresh_token = self._create_refresh_token(user.id)

        return TokenResponse(access_token=access_token, token_type="bearer", refresh_token=new_refresh_token)

    def get_current_user(self, token: str) -> Optional[User]:
        """Получение текущего пользователя из токена"""
        user_id = self._decode_token(token, token_type="access")
        if not user_id:
            return None

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            return None

        return user