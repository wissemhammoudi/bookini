"""Generic Redis cache helpers used by service-layer caching."""

import json
import logging

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


async def get_cached(redis: aioredis.Redis, key: str) -> dict | list | None:
    """Return the deserialized value for *key*, or None on cache miss / error."""
    try:
        raw = await redis.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception:
        logger.warning("Redis GET failed for key=%s", key, exc_info=True)
        return None


async def set_cached(
    redis: aioredis.Redis,
    key: str,
    data: dict | list,
    ttl: int,
) -> None:
    """Serialize *data* to JSON and store it under *key* with the given TTL
    (seconds)."""
    try:
        await redis.set(key, json.dumps(data, default=str), ex=ttl)
    except Exception:
        logger.warning("Redis SET failed for key=%s", key, exc_info=True)


async def invalidate(redis: aioredis.Redis, *keys: str) -> None:
    """Delete one or more cache keys. Swallows errors so mutations never fail."""
    try:
        if keys:
            await redis.delete(*keys)
    except Exception:
        logger.warning("Redis DEL failed for keys=%s", keys, exc_info=True)
