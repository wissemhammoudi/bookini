from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.floor_review import FloorReview


class FloorReviewRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_floor_and_user(
        self,
        *,
        floor_id: str,
        user_id: str,
    ) -> FloorReview | None:
        statement = select(FloorReview).where(
            FloorReview.floor_id == floor_id,
            FloorReview.user_id == user_id,
        )
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def list_for_floor(
        self,
        *,
        floor_id: str,
        limit: int = 50,
        offset: int = 0,
        min_rating: int | None = None,
        max_rating: int | None = None,
    ) -> list[FloorReview]:
        statement: Select[tuple[FloorReview]] = select(FloorReview).where(
            FloorReview.floor_id == floor_id
        )

        if min_rating is not None:
            statement = statement.where(FloorReview.rating >= min_rating)
        if max_rating is not None:
            statement = statement.where(FloorReview.rating <= max_rating)

        statement = statement.order_by(FloorReview.created_at.desc()).offset(offset).limit(
            limit
        )
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def create(
        self,
        *,
        floor_id: str,
        user_id: str,
        rating: int,
        comment: str | None,
    ) -> FloorReview:
        entity = FloorReview(
            floor_id=floor_id,
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
        entity: FloorReview,
        rating: int,
        comment: str | None,
    ) -> FloorReview:
        entity.rating = rating
        entity.comment = comment
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def delete(self, *, entity: FloorReview) -> None:
        await self._session.delete(entity)
        await self._session.commit()

    async def get_aggregate_for_floor(self, *, floor_id: str) -> tuple[float, int]:
        statement = select(
            func.avg(FloorReview.rating),
            func.count(FloorReview.id),
        ).where(FloorReview.floor_id == floor_id)
        result = await self._session.execute(statement)
        average, count = result.one()
        return (float(average) if average is not None else 0.0, int(count or 0))
