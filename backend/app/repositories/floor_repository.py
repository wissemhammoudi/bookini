from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums import FloorStatus
from app.models.floor import Floor


class FloorRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, floor: Floor) -> Floor:
        self._session.add(floor)
        await self._session.commit()
        await self._session.refresh(floor)
        return floor

    async def get_by_id(self, floor_id: str) -> Floor | None:
        try:
            import uuid

            uuid.UUID(floor_id)
        except ValueError:
            return None
        statement = select(Floor).where(Floor.id == floor_id)
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def list_floors(
        self,
        *,
        search: str | None,
        status: FloorStatus | None,
        building: str | None,
        floor_number: int | None,
        include_deleted: bool,
    ) -> list[Floor]:
        statement: Select[tuple[Floor]] = select(Floor)

        if not include_deleted:
            statement = statement.where(Floor.is_deleted.is_(False))
        if search:
            like_term = f"%{search}%"
            statement = statement.where(Floor.name.ilike(like_term))
        if status:
            statement = statement.where(Floor.status == status)
        if building:
            statement = statement.where(Floor.building == building)
        if floor_number is not None:
            statement = statement.where(Floor.floor_number == floor_number)

        statement = statement.order_by(Floor.created_at.desc())
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def list_floors_by_admin(
        self,
        *,
        admin_id: str,
        include_deleted: bool,
    ) -> list[Floor]:
        try:
            import uuid

            uuid.UUID(admin_id)
        except ValueError:
            return []
        statement: Select[tuple[Floor]] = select(Floor).where(
            Floor.admin_id == admin_id
        )

        if not include_deleted:
            statement = statement.where(Floor.is_deleted.is_(False))

        statement = statement.order_by(Floor.created_at.desc())
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def update(self, floor: Floor) -> Floor:
        await self._session.commit()
        await self._session.refresh(floor)
        return floor
