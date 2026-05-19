from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.schemas import ArticleResponse
from app.utils.database import get_db
from app.services.article_service import ArticleService

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/", response_model=List[ArticleResponse])
def search_articles(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Поиск по статьям"""
    article_service = ArticleService(db)
    return article_service.search(query=q, skip=skip, limit=limit)