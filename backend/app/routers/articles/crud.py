from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.schemas.schemas import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleDetailResponse
from app.models.models import User
from app.utils.database import get_db
from app.dependencies import get_current_user
from app.services.article_service import ArticleService

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.get("/", response_model=List[ArticleResponse])
def list_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Список статей с пагинацией и фильтрами"""
    article_service = ArticleService(db)
    return article_service.list(skip=skip, limit=limit, status=status)


@router.get("/my", response_model=List[ArticleResponse])
def get_my_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получение статей текущего пользователя"""
    article_service = ArticleService(db)
    return article_service.get_user_articles(current_user, skip=skip, limit=limit)


@router.get("/{slug}", response_model=ArticleDetailResponse)
def get_article(slug: str, db: Session = Depends(get_db)):
    """Просмотр статьи по slug"""
    article_service = ArticleService(db)
    return article_service.get_by_slug(slug)


@router.post("/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    data: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Создание статьи (авторизация)"""
    article_service = ArticleService(db)
    return article_service.create(current_user, data)


@router.put("/{slug}", response_model=ArticleResponse)
def update_article(
    slug: str,
    data: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновление статьи (автор)"""
    article_service = ArticleService(db)
    return article_service.update(current_user, slug, data)


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удаление статьи (автор/админ)"""
    article_service = ArticleService(db)
    article_service.delete(current_user, slug)