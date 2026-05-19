from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, EmailStr


# Схемы для User 

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Схемы для UserProfile 

class UserProfileBase(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    user_id: UUID

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None

class UserProfileResponse(UserProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Схемы для Role 

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class RoleResponse(RoleBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Схемы для UserRole

class UserRoleBase(BaseModel):
    user_id: UUID
    role_id: UUID

class UserRoleCreate(UserRoleBase):
    pass

class UserRoleResponse(UserRoleBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Схемы для Article

class ArticleBase(BaseModel):
    title: str
    slug: str
    content: str
    status: str = "draft"

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None

class ArticleResponse(ArticleBase):
    id: UUID
    author_id: UUID
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ArticleDetailResponse(ArticleResponse):
    author: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


# Схемы для View

class ViewBase(BaseModel):
    article_id: UUID
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ViewCreate(ViewBase):
    pass

class ViewResponse(ViewBase):
    id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Схемы для аутентификации

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
