"""Readiness probe — checks Postgres and Redis are reachable."""

from datetime import UTC, datetime

from sqlalchemy import text

from app.infrastructure.database import get_engine
from app.infrastructure.redis_client import get_redis_pool


async def readiness_snapshot() -> dict[str, object]:
    checks: dict[str, dict[str, object]] = {}

    # ── Postgres check ───────────────────────────────────────────────────────
    try:
        engine = get_engine()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = {"ready": True, "detail": "ok"}
    except Exception as exc:
        checks["database"] = {"ready": False, "detail": str(exc)}

    # ── Redis check ──────────────────────────────────────────────────────────
    try:
        redis = get_redis_pool()
        await redis.ping()
        checks["redis"] = {"ready": True, "detail": "ok"}
    except Exception as exc:
        checks["redis"] = {"ready": False, "detail": str(exc)}

    all_ready = all(bool(item["ready"]) for item in checks.values())

    return {
        "status": "ready" if all_ready else "not_ready",
        "timestamp": datetime.now(UTC).isoformat(),
        "checks": checks,
    }
