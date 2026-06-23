from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin_rating import AdminRating


class AdminRatingRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_admin_and_user(
        self,
        *,
        admin_id: str,
        user_id: str,
    ) -> AdminRating | None:
        statement = select(AdminRating).where(
            AdminRating.admin_id == admin_id,
            AdminRating.user_id == user_id,
        )
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def list_for_admin(
        self,
        *,
        admin_id: str,
        limit: int = 50,
        offset: int = 0,
        min_rating: int | None = None,
        max_rating: int | None = None,
    ) -> list[AdminRating]:
        statement: Select[tuple[AdminRating]] = select(AdminRating).where(
            AdminRating.admin_id == admin_id
        )

        if min_rating is not None:
            statement = statement.where(AdminRating.rating >= min_rating)
        if max_rating is not None:
            statement = statement.where(AdminRating.rating <= max_rating)

        statement = statement.order_by(AdminRating.created_at.desc()).offset(offset).limit(
            limit
        )
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def create(
        self,
        *,
        admin_id: str,
        user_id: str,
        rating: int,
        comment: str | None,
    ) -> AdminRating:
        entity = AdminRating(
            admin_id=admin_id,
            user_id=user_id,
            rating=rating,
            comment=comment,
        )
        self._session.add(entity)
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def update(
        self,
        *,
        entity: AdminRating,
        rating: int,
        comment: str | None,
    ) -> AdminRating:
        entity.rating = rating
        entity.comment = comment
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def delete(self, *, entity: AdminRating) -> None:
        await self._session.delete(entity)
        await self._session.commit()

    async def get_aggregate_for_admin(self, *, admin_id: str) -> tuple[float, int]:
        statement = select(
            func.avg(AdminRating.rating),
            func.count(AdminRating.id),
        ).where(AdminRating.admin_id == admin_id)
        result = await self._session.execute(statement)
        average, count = result.one()
        return (float(average) if average is not None else 0.0, int(count or 0))
