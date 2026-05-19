from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String, DateTime, Text, Uuid, Boolean, Integer, Float
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import func


class Base(DeclarativeBase):
    """Базовый класс для всех моделей"""
    pass


class User(Base):
    """Пользователь платформы"""
    __tablename__ = 'users'

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)  # UUID пользователя
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)  # Email (логин)
    password_hash: Mapped[str] = mapped_column(String(255))  # Хеш пароля
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)  # Статус активности
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())  # Дата регистрации
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())  # Дата обновления

    # Связи
    profile: Mapped[Optional["UserProfile"]] = relationship(back_populates="user", uselist=False)  # Профиль (1:1)
    roles: Mapped[list["UserRole"]] = relationship(back_populates="user")  # Роли (N:N)
    articles: Mapped[list["Article"]] = relationship(back_populates="author")  # Статьи автора (1:N)
    views: Mapped[list["View"]] = relationship(back_populates="user")  # Просмотры (1:N)


class UserProfile(Base):
    """Профиль пользователя"""
    __tablename__ = 'user_profiles'

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), unique=True)  # Связь с пользователем
    display_name: Mapped[Optional[str]] = mapped_column(String(100))  # Отображаемое имя
    bio: Mapped[Optional[str]] = mapped_column(Text)  # Биография
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))  # URL аватара
    website: Mapped[Optional[str]] = mapped_column(String(500))  # Личный сайт
    github: Mapped[Optional[str]] = mapped_column(String(500))  # GitHub профиль
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="profile")  # Обратная связь


class Role(Base):
    """Роль пользователя"""
    __tablename__ = 'roles'

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True)  # Название роли (admin, moderator, user)
    description: Mapped[Optional[str]] = mapped_column(String(200))  # Описание роли

    user_roles: Mapped[list["UserRole"]] = relationship(back_populates="role")  # Связи с пользователями


class UserRole(Base):
    """Связь пользователя и роли (N:N)"""
    __tablename__ = 'user_roles'

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))  # ID пользователя
    role_id: Mapped[UUID] = mapped_column(ForeignKey("roles.id"))  # ID роли
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())  # Дата назначения роли

    user: Mapped["User"] = relationship(back_populates="roles")
    role: Mapped["Role"] = relationship(back_populates="user_roles")




class Article(Base):
    """Статья"""
    __tablename__ = 'articles'

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(300))  # Заголовок статьи
    slug: Mapped[str] = mapped_column(String(300), unique=True, index=True)  # URL-идентификатор
    content: Mapped[str] = mapped_column(Text)  # Контент статьи (markdown)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # Статус: draft, published, archived
    author_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))  # ID автора
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())  # Дата создания
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())  # Дата обновления
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime)  # Дата публикации

    # Связи
    author: Mapped["User"] = relationship(back_populates="articles")  # Автор статьи
    views: Mapped[list["View"]] = relationship(back_populates="article", cascade="all, delete-orphan")  # Просмотры


class View(Base):
    """Просмотр статьи (аналитика)"""
    __tablename__ = 'views'

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    user_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("users.id"))  # ID пользователя (null для анонимов)
    article_id: Mapped[UUID] = mapped_column(ForeignKey("articles.id"))  # ID статьи
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))  # IP-адрес
    user_agent: Mapped[Optional[str]] = mapped_column(String(500))  # User-Agent браузера
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())  # Дата просмотра

    user: Mapped[Optional["User"]] = relationship(back_populates="views")  # Пользователь
    article: Mapped["Article"] = relationship(back_populates="views")  # Статья
