from datetime import UTC, datetime

import redis.asyncio as aioredis

from app.infrastructure.cache import get_cached, set_cached
from app.repositories.analytics_repository import AnalyticsRepository

_STATS_SUMMARY_KEY = "bookini:stats:summary"
_STATS_MOST_RESERVED_KEY = "bookini:stats:most_reserved"
_STATS_PEAK_HOURS_KEY = "bookini:stats:peak_hours"
_STATS_TTL = 60  # seconds — analytics can tolerate ~1 min staleness


class StatisticsService:
    def __init__(
        self,
        analytics_repository: AnalyticsRepository,
        redis: aioredis.Redis | None = None,
    ) -> None:
        self._analytics_repository = analytics_repository
        self._redis = redis

    async def summary_metrics(self, now: datetime | None = None) -> dict[str, object]:
        # ── Cache read ──────────────────────────────────────────────────────
        if self._redis is not None:
            cached = await get_cached(self._redis, _STATS_SUMMARY_KEY)
            if cached is not None:
                return cached  # type: ignore[return-value]

        reference = now or datetime.now(UTC)

        start_day = reference.replace(hour=0, minute=0, second=0, microsecond=0)
        start_month = reference.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )
        start_year = reference.replace(
            month=1,
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        total_reservations = await self._analytics_repository.total_reservations()
        daily_reservations = await self._analytics_repository.reservations_between(
            start_day,
            reference,
        )
        monthly_reservations = await self._analytics_repository.reservations_between(
            start_month,
            reference,
        )
        annual_reservations = await self._analytics_repository.reservations_between(
            start_year,
            reference,
        )
        cancelled_reservations = (
            await self._analytics_repository.cancelled_reservations()
        )

        cancellation_rate = (
            (cancelled_reservations / total_reservations) * 100
            if total_reservations > 0
            else 0.0
        )

        active_users = await self._analytics_repository.active_users(
            start_month, reference
        )

        result: dict[str, object] = {
            "total_reservations": total_reservations,
            "daily_reservations": daily_reservations,
            "monthly_reservations": monthly_reservations,
            "annual_reservations": annual_reservations,
            "cancellation_rate": round(cancellation_rate, 2),
            "active_users": active_users,
            "charts": {
                "bar": {
                    "labels": ["Daily", "Monthly", "Annual"],
                    "series": [
                        daily_reservations,
                        monthly_reservations,
                        annual_reservations,
                    ],
                },
                "line": {
                    "labels": ["Total", "Cancelled"],
                    "series": [total_reservations, cancelled_reservations],
                },
                "pie": {
                    "labels": ["Cancelled", "Active"],
                    "series": [
                        cancelled_reservations,
                        max(total_reservations - cancelled_reservations, 0),
                    ],
                },
            },
        }

        # ── Cache write ─────────────────────────────────────────────────────
        if self._redis is not None:
            await set_cached(self._redis, _STATS_SUMMARY_KEY, result, _STATS_TTL)

        return result

    async def most_reserved_rooms(self, limit: int = 5) -> dict[str, object]:
        cache_key = f"{_STATS_MOST_RESERVED_KEY}:{limit}"

        if self._redis is not None:
            cached = await get_cached(self._redis, cache_key)
            if cached is not None:
                return cached  # type: ignore[return-value]

        rows = await self._analytics_repository.most_reserved_rooms(limit=limit)
        result: dict[str, object] = {
            "items": rows,
            "chart": {
                "type": "bar",
                "labels": [item["room"] for item in rows],
                "series": [item["reservations"] for item in rows],
            },
        }

        if self._redis is not None:
            await set_cached(self._redis, cache_key, result, _STATS_TTL)

        return result

    async def peak_hours(self, limit: int = 6) -> dict[str, object]:
        cache_key = f"{_STATS_PEAK_HOURS_KEY}:{limit}"

        if self._redis is not None:
            cached = await get_cached(self._redis, cache_key)
            if cached is not None:
                return cached  # type: ignore[return-value]

        rows = await self._analytics_repository.peak_reservation_hours(limit=limit)
        labels = [f"{item['hour']:02d}:00" for item in rows]
        result: dict[str, object] = {
            "items": rows,
            "chart": {
                "type": "line",
                "labels": labels,
                "series": [item["reservations"] for item in rows],
            },
        }

        if self._redis is not None:
            await set_cached(self._redis, cache_key, result, _STATS_TTL)

        return result
