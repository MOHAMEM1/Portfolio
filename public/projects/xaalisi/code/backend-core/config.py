from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./xaalisi.db"
    ENVIRONMENT: str = "production"
    DEFAULT_CURRENCY: str = "FCFA"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8081,http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
