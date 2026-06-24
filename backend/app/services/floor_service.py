from app.domain.enums import FloorStatus
from app.models.floor import Floor
from app.repositories.floor_repository import FloorRepository


class FloorService:
    def __init__(self, repository: FloorRepository) -> None:
        self._repository = repository

    async def list_floors(
        self,
        *,
        search: str | None,
        status: FloorStatus | None,
        building: str | None,
        floor_number: int | None,
        include_deleted: bool,
    ) -> list[Floor]:
        return await self._repository.list_floors(
            search=search,
            status=status,
            building=building,
            floor_number=floor_number,
            include_deleted=include_deleted,
        )
