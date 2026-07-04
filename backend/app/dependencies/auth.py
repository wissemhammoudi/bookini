import json
import logging

import redis.asyncio as aioredis
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_token, is_token_blacklisted
from app.infrastructure.redis_client import get_redis
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)

_USER_CACHE_PREFIX = "bookini:user:"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db_session),
    redis: aioredis.Redis = Depends(get_redis),
) -> User:
    if not credentials:
        raise UnauthorizedException("Authentication credentials were not provided")

    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise UnauthorizedException("Invalid access token")

    # ── Blacklist check ─────────────────────────────────────────────────────
    if await is_token_blacklisted(redis, payload):
        raise UnauthorizedException("Token has been revoked")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token subject")

    # ── User cache (short-circuit DB call on every authenticated request) ───
    cache_key = f"{_USER_CACHE_PREFIX}{user_id}"
    try:
        cached_raw = await redis.get(cache_key)
        if cached_raw:
            cached = json.loads(cached_raw)
            # Re-validate minimal fields; fall through to DB if anything is off.
            if cached.get("is_active"):
                # Build a lightweight User-like object from cache to avoid ORM overhead.
                # We still need the real ORM User for relationships, but for
                # auth-only endpoints this saves the SELECT.
                repository = UserRepository(session)
                # Fast path: return cached stub — create a transient User instance.
                user = User()
                user.id = cached["id"]
                user.email = cached["email"]
                user.full_name = cached["full_name"]
                user.role = cached["role"]
                user.is_active = cached["is_active"]
                user.avatar_url = cached.get("avatar_url")
                return user
    except Exception:
        logger.warning(
            "Redis user cache read failed for user_id=%s",
            user_id,
            exc_info=True,
        )

    # ── DB fallback (cache miss or Redis error) ─────────────────────────────
    repository = UserRepository(session)
    user = await repository.get_by_id(user_id)
    if not user or not user.is_active:
        raise UnauthorizedException("User not authorized")

    # Populate cache for next request — TTL matches access token lifetime.
    settings = get_settings()
    ttl = settings.access_token_expire_minutes * 60
    try:
        await redis.set(
            cache_key,
            json.dumps({
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_active": user.is_active,
                "avatar_url": user.avatar_url,
            }),
            ex=ttl,
        )
    except Exception:
        logger.warning(
            "Redis user cache write failed for user_id=%s",
            user_id,
            exc_info=True,
        )

    return user
