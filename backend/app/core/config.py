from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="Smart Floor Reservation System API")
    app_version: str = Field(default="1.0.0")
    app_env: Literal["development", "staging", "production"] = Field(
        default="development"
    )
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO"
    )

    api_v1_prefix: str = Field(default="/api/v1")
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000, ge=1, le=65535)

    database_url: str = Field(min_length=1)
    redis_url: str = Field(min_length=1)


@lru_cache
def get_settings() -> Settings:
    return Settings()
