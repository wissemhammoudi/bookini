"""Redis async client — singleton pool shared across the app lifetime."""

from collections.abc import AsyncGenerator

import redis.asyncio as aioredis

from app.core.config import get_settings

_redis_pool: aioredis.Redis | None = None


def get_redis_pool() -> aioredis.Redis:
    """Return (or lazily create) the shared Redis connection pool."""
    global _redis_pool
    if _redis_pool is None:
        settings = get_settings()
        _redis_pool = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_pool


async def close_redis_pool() -> None:
    """Close the Redis pool — call this in the app lifespan shutdown."""
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None


# FastAPI dependency
async def get_redis() -> AsyncGenerator[aioredis.Redis, None]:
    """Yield the shared Redis client as a FastAPI dependency."""
    yield get_redis_pool()
