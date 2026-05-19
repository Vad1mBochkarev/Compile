from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Локальная PostgreSQL (подключается через pgAdmin)
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/compile_db"
    JWT_SECRET: str = "secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"


settings = Settings()