from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

import jwt
import redis.asyncio as aioredis
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_BLACKLIST_PREFIX = "bookini:token:blacklist:"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _build_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "jti": uuid4().hex,          # unique token ID — used for blacklisting
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_access_token(subject: str) -> str:
    settings = get_settings()
    delta = timedelta(minutes=settings.access_token_expire_minutes)
    return _build_token(subject=subject, token_type="access", expires_delta=delta)


def create_refresh_token(subject: str) -> str:
    settings = get_settings()
    delta = timedelta(days=settings.refresh_token_expire_days)
    return _build_token(subject=subject, token_type="refresh", expires_delta=delta)


def create_password_reset_token(subject: str, expires_minutes: int = 30) -> str:
    return _build_token(
        subject=subject,
        token_type="password_reset",
        expires_delta=timedelta(minutes=expires_minutes),
    )


def decode_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except jwt.PyJWTError as exc:
        raise UnauthorizedException("Invalid or expired token") from exc


# ---------------------------------------------------------------------------
# Token blacklist helpers (Redis-backed)
# ---------------------------------------------------------------------------

async def blacklist_token(
    redis: aioredis.Redis,
    payload: dict[str, Any],
) -> None:
    """Store *jti* in Redis until the token's natural expiry."""
    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not exp:
        return

    now_ts = int(datetime.now(UTC).timestamp())
    ttl = max(exp - now_ts, 1)          # remaining seconds (at least 1)
    await redis.set(f"{_BLACKLIST_PREFIX}{jti}", "1", ex=ttl)


async def is_token_blacklisted(
    redis: aioredis.Redis,
    payload: dict[str, Any],
) -> bool:
    """Return True if the token's *jti* is on the blacklist."""
    jti = payload.get("jti")
    if not jti:
        # Old tokens without jti are treated as NOT blacklisted for
        # backward-compatibility; they will expire naturally.
        return False
    result = await redis.exists(f"{_BLACKLIST_PREFIX}{jti}")
    return bool(result)
