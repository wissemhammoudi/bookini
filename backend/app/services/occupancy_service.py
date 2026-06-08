from app.repositories.analytics_repository import AnalyticsRepository


class OccupancyService:
    def __init__(self, analytics_repository: AnalyticsRepository) -> None:
        self._analytics_repository = analytics_repository

    async def occupancy_metrics(self) -> dict[str, object]:
        total_rooms = await self._analytics_repository.total_rooms()
        occupied_rooms = await self._analytics_repository.occupied_rooms()
        available_rooms = max(total_rooms - occupied_rooms, 0)

        occupancy_percentage = (
            (occupied_rooms / total_rooms) * 100 if total_rooms > 0 else 0.0
        )

        return {
            "total_rooms": total_rooms,
            "occupied_rooms": occupied_rooms,
            "available_rooms": available_rooms,
            "occupancy_percentage": round(occupancy_percentage, 2),
            "chart": {
                "type": "pie",
                "labels": ["Occupied", "Available"],
                "series": [occupied_rooms, available_rooms],
            },
        }
