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

    secret_key: str = Field(min_length=16)
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=15, ge=1)
    refresh_token_expire_days: int = Field(default=7, ge=1)

    database_url: str = Field(min_length=1)
    redis_url: str = Field(min_length=1)
    cors_allow_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost",
            "http://127.0.0.1",
        ]
    )

    seed_super_admin: bool = Field(default=True)
    seed_default_users: bool = Field(default=False)
    seed_user_email: str = Field(default="user@bookiwa7dek.com")
    seed_user_password: str = Field(default="User123456!")
    seed_admin_email: str = Field(default="admin@bookiwa7dek.com")
    seed_admin_password: str = Field(default="Admin123456!")
    seed_super_admin_email: str = Field(default="superadmin@bookiwa7dek.com")
    seed_super_admin_password: str = Field(default="SuperAdmin123456!")

    minio_endpoint: str = Field(default="minio:9000")
    minio_access_key: str = Field(default="minioadmin")
    minio_secret_key: str = Field(default="minioadmin")
    minio_bucket: str = Field(default="bookini")
    minio_secure: bool = Field(default=False)


@lru_cache
def get_settings() -> Settings:
    return Settings()
