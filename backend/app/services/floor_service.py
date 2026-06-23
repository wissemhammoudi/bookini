import uuid

from app.core.exceptions import NotFoundException
from app.domain.enums import FloorStatus
from app.models.floor import Floor
from app.repositories.floor_repository import FloorRepository


class FloorService:
    def __init__(self, repository: FloorRepository) -> None:
        self._repository = repository

    async def create_floor(
        self,
        *,
        admin_id: uuid.UUID | None,
        name: str,
        capacity: int,
        building: str,
        floor_number: int,
        location: str,
        description: str | None,
        status: FloorStatus,
    ) -> Floor:
        floor = Floor(
            admin_id=admin_id,
            name=name,
            capacity=capacity,
            building=building,
            floor_number=floor_number,
            location=location,
            description=description,
            status=status,
        )
        return await self._repository.create(floor)

    async def update_floor(self, floor_id: str, payload: dict[str, object]) -> Floor:
        floor = await self._repository.get_by_id(floor_id)
        if not floor or floor.is_deleted:
            raise NotFoundException("Floor not found")

        for key, value in payload.items():
            if value is not None and hasattr(floor, key):
                setattr(floor, key, value)

        return await self._repository.update(floor)

    async def delete_floor(self, floor_id: str) -> Floor:
        floor = await self._repository.get_by_id(floor_id)
        if not floor or floor.is_deleted:
            raise NotFoundException("Floor not found")

        floor.is_deleted = True
        return await self._repository.update(floor)

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
