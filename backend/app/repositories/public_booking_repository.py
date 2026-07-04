import uuid

from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums import PublicBookingStatus
from app.models.public_booking import PublicBooking


class PublicBookingRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, booking_data: dict) -> PublicBooking:
        booking = PublicBooking(**booking_data)
        self.session.add(booking)
        await self.session.flush()
        return booking

    async def get_by_reference(self, reference: str) -> PublicBooking | None:
        stmt = select(PublicBooking).where(PublicBooking.booking_reference == reference)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, booking_id: uuid.UUID) -> PublicBooking | None:
        return await self.session.get(PublicBooking, booking_id)

    async def list_all(self, skip: int = 0, limit: int = 50) -> list[PublicBooking]:
        stmt = (
            select(PublicBooking)
            .order_by(desc(PublicBooking.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_status(
        self, status: PublicBookingStatus, skip: int = 0, limit: int = 50
    ) -> list[PublicBooking]:
        stmt = (
            select(PublicBooking)
            .where(PublicBooking.status == status)
            .order_by(desc(PublicBooking.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_email(
        self, email: str, skip: int = 0, limit: int = 50
    ) -> list[PublicBooking]:
        stmt = (
            select(PublicBooking)
            .where(PublicBooking.guest_email == email)
            .order_by(desc(PublicBooking.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_room_and_date_range(
        self,
        room_id: int,
        start_date: str,
        end_date: str,
        statuses: list[PublicBookingStatus] | None = None,
        limit: int = 500,
    ) -> list[PublicBooking]:
        from datetime import datetime, timedelta

        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query_start_dt = start_dt - timedelta(days=60)
            query_start_date = query_start_dt.strftime("%Y-%m-%d")
        except ValueError:
            query_start_date = start_date

        filters = [
            PublicBooking.room_id == room_id,
            PublicBooking.booking_date >= query_start_date,
            PublicBooking.booking_date <= end_date,
        ]
        if statuses:
            filters.append(PublicBooking.status.in_(statuses))

        stmt = (
            select(PublicBooking)
            .where(and_(*filters))
            .order_by(PublicBooking.booking_date.asc(), PublicBooking.start_time.asc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        bookings = result.scalars().all()

        filtered_bookings = []
        for booking in bookings:
            b_start = booking.booking_date
            b_end = (booking.metadata_payload or {}).get("end_date") or b_start
            if b_start <= end_date and b_end >= start_date:
                filtered_bookings.append(booking)
        return filtered_bookings

    async def update_status(
        self,
        booking_id: uuid.UUID,
        status: PublicBookingStatus,
        admin_notes: str | None = None,
    ) -> PublicBooking | None:
        booking = await self.get_by_id(booking_id)
        if not booking:
            return None

        booking.status = status
        if admin_notes:
            booking.admin_notes = admin_notes

        await self.session.flush()
        return booking

    async def delete(self, booking_id: uuid.UUID) -> bool:
        booking = await self.get_by_id(booking_id)
        if not booking:
            return False

        await self.session.delete(booking)
        await self.session.flush()
        return True

    async def count_all(self) -> int:
        stmt = select(PublicBooking).with_only_columns(PublicBooking.id)
        result = await self.session.execute(stmt)
        return len(result.scalars().all())

    async def count_by_status(self, status: PublicBookingStatus) -> int:
        stmt = select(PublicBooking).where(PublicBooking.status == status)
        result = await self.session.execute(stmt)
        return len(result.scalars().all())
