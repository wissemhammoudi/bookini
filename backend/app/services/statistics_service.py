from datetime import UTC, datetime

from app.repositories.analytics_repository import AnalyticsRepository


class StatisticsService:
    def __init__(self, analytics_repository: AnalyticsRepository) -> None:
        self._analytics_repository = analytics_repository

    async def summary_metrics(self, now: datetime | None = None) -> dict[str, object]:
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

        return {
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

    async def most_reserved_rooms(self, limit: int = 5) -> dict[str, object]:
        rows = await self._analytics_repository.most_reserved_rooms(limit=limit)
        return {
            "items": rows,
            "chart": {
                "type": "bar",
                "labels": [item["room"] for item in rows],
                "series": [item["reservations"] for item in rows],
            },
        }

    async def peak_hours(self, limit: int = 6) -> dict[str, object]:
        rows = await self._analytics_repository.peak_reservation_hours(limit=limit)
        labels = [f"{item['hour']:02d}:00" for item in rows]
        return {
            "items": rows,
            "chart": {
                "type": "line",
                "labels": labels,
                "series": [item["reservations"] for item in rows],
            },
        }
