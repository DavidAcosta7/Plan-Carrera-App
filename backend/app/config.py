from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Cargar .env desde la carpeta backend (funciona aunque se ejecute desde otra ruta)
_env_path = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Configuración de la aplicación."""
    
    # Base
    APP_NAME: str = "Plan Carrera API"
    DEBUG: bool = False
    
    # Base de datos
    DATABASE_URL: str = "sqlite:///./plan_carrera.db"
    
    # JWT / Auth (si se usa)
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    # Groq AI (reemplaza Claude)
    GROQ_API_KEY: str = ""
    
    class Config:
        env_file = str(_env_path) if _env_path.exists() else ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
