import os
import shutil
from pydantic_settings import BaseSettings, SettingsConfigDict

if os.environ.get("VERCEL"):
    if not os.path.exists("/tmp/xaalisi.db"):
        shutil.copy("api/xaalisi.db", "/tmp/xaalisi.db")
    db_url = "sqlite:////tmp/xaalisi.db"
else:
    db_url = "sqlite:///./xaalisi.db"

class Settings(BaseSettings):
    SECRET_KEY: str = "b71c26bdfdd285db6e11b33b003ba7f2bed7c5da12345678a1bc"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = db_url
    ENVIRONMENT: str = "production"
    DEFAULT_CURRENCY: str = "FCFA"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8081,http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
