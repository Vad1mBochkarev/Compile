from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.schemas import TokenResponse
from app.utils.database import get_db
from app.services.auth_service import AuthService

router = APIRouter(prefix="/refresh", tags=["Authentication"])


@router.post("/")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Обновление access токена"""
    auth_service = AuthService(db)
    return auth_service.refresh_token(refresh_token)