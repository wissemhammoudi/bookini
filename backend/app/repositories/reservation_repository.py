from datetime import datetime

from sqlalchemy import Select, and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums import ReservationStatus
from app.models.floor import Floor
from app.models.reservation import Reservation


class ReservationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, reservation: Reservation) -> Reservation:
        self._session.add(reservation)
        await self._session.commit()
        await self._session.refresh(reservation)
        return reservation

    async def get_by_id(self, reservation_id: str) -> Reservation | None:
        statement = select(Reservation).where(Reservation.id == reservation_id)
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def has_overlap(
        self,
        *,
        floor_id: str,
        start_time: datetime,
        end_time: datetime,
    ) -> bool:
        statement = select(Reservation).where(
            Reservation.floor_id == floor_id,
            Reservation.status.not_in(
                [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED]
            ),
            and_(Reservation.start_time < end_time, Reservation.end_time > start_time),
        )
        result = await self._session.execute(statement)
        return result.scalar_one_or_none() is not None

    async def list_user_history(self, user_id: str) -> list[Reservation]:
        statement: Select[tuple[Reservation]] = (
            select(Reservation)
            .where(Reservation.user_id == user_id)
            .order_by(Reservation.start_time.desc())
        )
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def list_user_current(self, user_id: str, now: datetime) -> list[Reservation]:
        statement: Select[tuple[Reservation]] = (
            select(Reservation)
            .where(
                Reservation.user_id == user_id,
                Reservation.status.in_(
                    [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]
                ),
                Reservation.end_time >= now,
            )
            .order_by(Reservation.start_time.asc())
        )
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def list_all(self) -> list[Reservation]:
        statement: Select[tuple[Reservation]] = select(Reservation).order_by(
            Reservation.start_time.desc()
        )
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def cancel(self, reservation: Reservation) -> Reservation:
        reservation.status = ReservationStatus.CANCELLED
        await self._session.commit()
        await self._session.refresh(reservation)
        return reservation

    async def has_completed_reservation_for_floor(
        self,
        *,
        user_id: str,
        floor_id: str,
    ) -> bool:
        statement = (
            select(Reservation.id)
            .where(
                Reservation.user_id == user_id,
                Reservation.floor_id == floor_id,
                Reservation.status == ReservationStatus.COMPLETED,
            )
            .limit(1)
        )
        result = await self._session.execute(statement)
        return result.scalar_one_or_none() is not None

    async def has_completed_reservation_with_admin(
        self,
        *,
        user_id: str,
        admin_id: str,
    ) -> bool:
        statement = (
            select(Reservation.id)
            .join(Floor, Floor.id == Reservation.floor_id)
            .where(
                Reservation.user_id == user_id,
                Reservation.status == ReservationStatus.COMPLETED,
                Floor.admin_id == admin_id,
                Floor.is_deleted.is_(False),
            )
            .limit(1)
        )
        result = await self._session.execute(statement)
        return result.scalar_one_or_none() is not None
