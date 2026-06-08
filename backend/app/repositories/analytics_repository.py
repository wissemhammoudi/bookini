from datetime import datetime

from sqlalchemy import Select, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums import FloorStatus, ReservationStatus
from app.models.floor import Floor
from app.models.reservation import Reservation


class AnalyticsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def total_rooms(self) -> int:
        statement = select(func.count(Floor.id)).where(Floor.is_deleted.is_(False))
        result = await self._session.execute(statement)
        return int(result.scalar_one() or 0)

    async def occupied_rooms(self) -> int:
        statement = select(func.count(Floor.id)).where(
            Floor.is_deleted.is_(False),
            Floor.status == FloorStatus.OCCUPIED,
        )
        result = await self._session.execute(statement)
        return int(result.scalar_one() or 0)

    async def total_reservations(self) -> int:
        statement = select(func.count(Reservation.id))
        result = await self._session.execute(statement)
        return int(result.scalar_one() or 0)

    async def reservations_between(self, start: datetime, end: datetime) -> int:
        statement = select(func.count(Reservation.id)).where(
            Reservation.created_at >= start,
            Reservation.created_at < end,
        )
        result = await self._session.execute(statement)
        return int(result.scalar_one() or 0)

    async def cancelled_reservations(self) -> int:
        statement = select(func.count(Reservation.id)).where(
            Reservation.status == ReservationStatus.CANCELLED
        )
        result = await self._session.execute(statement)
        return int(result.scalar_one() or 0)

    async def most_reserved_rooms(self, limit: int = 5) -> list[dict[str, object]]:
        statement: Select[tuple[str, int]] = (
            select(Floor.name, func.count(Reservation.id).label("count"))
            .join(Reservation, Reservation.floor_id == Floor.id)
            .group_by(Floor.name)
            .order_by(func.count(Reservation.id).desc())
            .limit(limit)
        )
        result = await self._session.execute(statement)
        rows = result.all()
        return [
            {"room": room_name, "reservations": int(total_count)}
            for room_name, total_count in rows
        ]

    async def peak_reservation_hours(self, limit: int = 6) -> list[dict[str, object]]:
        hour_expr = func.extract("hour", Reservation.start_time)
        statement: Select[tuple[float, int]] = (
            select(hour_expr.label("hour"), func.count(Reservation.id).label("count"))
            .group_by(hour_expr)
            .order_by(func.count(Reservation.id).desc())
            .limit(limit)
        )
        result = await self._session.execute(statement)
        rows = result.all()
        return [
            {"hour": int(hour), "reservations": int(total_count)}
            for hour, total_count in rows
        ]

    async def active_users(self, start: datetime, end: datetime) -> int:
        statement = select(func.count(distinct(Reservation.user_id))).where(
            Reservation.created_at >= start,
            Reservation.created_at < end,
        )
        result = await self._session.execute(statement)
        return int(result.scalar_one() or 0)
