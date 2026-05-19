from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.models import User, Article
from app.schemas.schemas import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleDetailResponse, UserResponse


class ArticleService:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 20, category_id: Optional[UUID] = None, status: Optional[str] = None) -> List[ArticleResponse]:
        """Список статей с фильтрами"""
        query = self.db.query(Article)

        if status:
            query = query.filter(Article.status == status)
        else:
            # По умолчанию показываем только опубликованные
            query = query.filter(Article.status == "published")

        if category_id:
            # category_id пока не используется в модели, но оставляем для совместимости
            pass

        articles = query.order_by(Article.created_at.desc()).offset(skip).limit(limit).all()
        return [ArticleResponse.model_validate(a) for a in articles]

    def get_by_slug(self, slug: str) -> ArticleDetailResponse:
        """Получение статьи по slug"""
        article = self.db.query(Article).filter(Article.slug == slug).first()
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Статья не найдена"
            )

        # Загружаем автора
        author = article.author
        author_response = UserResponse.model_validate(author) if author else None

        result = ArticleDetailResponse.model_validate(article)
        result.author = author_response
        return result

    def get_by_id(self, article_id: UUID) -> ArticleResponse:
        """Получение статьи по ID"""
        article = self.db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Статья не найдена"
            )
        return ArticleResponse.model_validate(article)

    def create(self, author: User, data: ArticleCreate) -> ArticleResponse:
        """Создание статьи"""
        # Проверка уникальности slug
        existing = self.db.query(Article).filter(Article.slug == data.slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Статья с таким URL уже существует"
            )

        article = Article(
            title=data.title,
            slug=data.slug,
            content=data.content,
            status=data.status,
            author_id=author.id,
        )
        self.db.add(article)
        self.db.commit()
        self.db.refresh(article)

        return ArticleResponse.model_validate(article)

    def update(self, user: User, slug: str, data: ArticleUpdate) -> ArticleResponse:
        """Обновление статьи"""
        article = self.db.query(Article).filter(Article.slug == slug).first()
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Статья не найдена"
            )

        # Проверка авторства
        if article.author_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы не являетесь автором этой статьи"
            )

        # Проверка уникальности slug если он меняется
        if data.slug and data.slug != article.slug:
            existing = self.db.query(Article).filter(Article.slug == data.slug).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Статья с таким URL уже существует"
                )

        # Обновление полей
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(article, field, value)

        # Если статус меняется на published - устанавливаем published_at
        if data.status == "published" and not article.published_at:
            article.published_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(article)

        return ArticleResponse.model_validate(article)

    def delete(self, user: User, slug: str) -> None:
        """Удаление статьи"""
        article = self.db.query(Article).filter(Article.slug == slug).first()
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Статья не найдена"
            )

        # Проверка авторства
        if article.author_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы не являетесь автором этой статьи"
            )

        self.db.delete(article)
        self.db.commit()

    def search(self, query: str, skip: int = 0, limit: int = 20) -> List[ArticleResponse]:
        """Поиск по статьям"""
        articles = self.db.query(Article).filter(
            Article.status == "published",
            Article.title.ilike(f"%{query}%")
        ).order_by(Article.created_at.desc()).offset(skip).limit(limit).all()

        return [ArticleResponse.model_validate(a) for a in articles]

    def get_user_articles(self, user: User, skip: int = 0, limit: int = 20) -> List[ArticleResponse]:
        """Получение статей пользователя"""
        articles = self.db.query(Article).filter(
            Article.author_id == user.id
        ).order_by(Article.created_at.desc()).offset(skip).limit(limit).all()

        return [ArticleResponse.model_validate(a) for a in articles]