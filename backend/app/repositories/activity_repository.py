from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity import Activity


class ActivityRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, activity: Activity) -> Activity:
        self._session.add(activity)
        await self._session.commit()
        await self._session.refresh(activity)
        return activity

    async def get_by_id(self, activity_id: str) -> Activity | None:
        statement = select(Activity).where(Activity.id == activity_id)
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_reservation(self, reservation_id: str) -> list[Activity]:
        statement: Select[tuple[Activity]] = (
            select(Activity)
            .where(Activity.reservation_id == reservation_id)
            .order_by(Activity.created_at.desc())
        )
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def update(self, activity: Activity) -> Activity:
        await self._session.commit()
        await self._session.refresh(activity)
        return activity

    async def delete(self, activity: Activity) -> None:
        await self._session.delete(activity)
        await self._session.commit()
