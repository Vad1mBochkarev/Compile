from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth.register import router as auth_register_router
from app.routers.auth.login import router as auth_login_router
from app.routers.auth.refresh import router as auth_refresh_router
from app.routers.users.profile import router as users_profile_router
from app.routers.articles.crud import router as articles_crud_router
from app.routers.articles.search import router as articles_search_router
from app.models.models import Base  # noqa: F401 - импортирует все модели
from app.utils.database import engine

app = FastAPI(
    title="Compile API",
    description="API для платформы разработчиков Compile",
    version="1.0.0",
)


@app.on_event("startup")
def init_db():
    """При запуске проверяет и создаёт таблицы, если их нет"""
    print("Проверка таблиц...")
    Base.metadata.create_all(engine)
    print("Таблицы готовы к работе.")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth_register_router, prefix="/api")
app.include_router(auth_login_router, prefix="/api")
app.include_router(auth_refresh_router, prefix="/api")
app.include_router(users_profile_router, prefix="/api")
app.include_router(articles_crud_router, prefix="/api")
app.include_router(articles_search_router, prefix="/api")


@app.get("/api/health")
def health_check():
    """Проверка работоспособности"""
    return {"status": "ok"}