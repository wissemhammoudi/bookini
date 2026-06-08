from datetime import UTC, datetime

import pytest

from app.services.occupancy_service import OccupancyService
from app.services.statistics_service import StatisticsService


class FakeAnalyticsRepository:
    async def total_rooms(self) -> int:
        return 20

    async def occupied_rooms(self) -> int:
        return 8

    async def total_reservations(self) -> int:
        return 100

    async def reservations_between(self, start: datetime, end: datetime) -> int:
        _ = (start, end)
        return 10

    async def cancelled_reservations(self) -> int:
        return 25

    async def most_reserved_rooms(self, limit: int = 5) -> list[dict[str, object]]:
        _ = limit
        return [
            {"room": "A-101", "reservations": 50},
            {"room": "B-202", "reservations": 30},
        ]

    async def peak_reservation_hours(self, limit: int = 6) -> list[dict[str, object]]:
        _ = limit
        return [
            {"hour": 9, "reservations": 20},
            {"hour": 14, "reservations": 15},
        ]

    async def active_users(self, start: datetime, end: datetime) -> int:
        _ = (start, end)
        return 12


@pytest.mark.asyncio
async def test_occupancy_metrics_returns_expected_shape() -> None:
    service = OccupancyService(FakeAnalyticsRepository())
    data = await service.occupancy_metrics()

    assert data["total_rooms"] == 20
    assert data["occupied_rooms"] == 8
    assert data["available_rooms"] == 12
    assert data["occupancy_percentage"] == 40.0
    assert data["chart"]["labels"] == ["Occupied", "Available"]


@pytest.mark.asyncio
async def test_statistics_summary_returns_chart_ready_payloads() -> None:
    service = StatisticsService(FakeAnalyticsRepository())
    data = await service.summary_metrics(now=datetime.now(UTC))

    assert data["total_reservations"] == 100
    assert data["daily_reservations"] == 10
    assert data["monthly_reservations"] == 10
    assert data["annual_reservations"] == 10
    assert data["cancellation_rate"] == 25.0
    assert data["active_users"] == 12
    assert "bar" in data["charts"]
    assert "line" in data["charts"]
    assert "pie" in data["charts"]


@pytest.mark.asyncio
async def test_statistics_room_and_peak_reports_are_chart_ready() -> None:
    service = StatisticsService(FakeAnalyticsRepository())

    rooms = await service.most_reserved_rooms(limit=5)
    peaks = await service.peak_hours(limit=6)

    assert rooms["items"][0]["room"] == "A-101"
    assert rooms["chart"]["labels"] == ["A-101", "B-202"]

    assert peaks["items"][0]["hour"] == 9
    assert peaks["chart"]["labels"] == ["09:00", "14:00"]
