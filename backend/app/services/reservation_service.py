from datetime import UTC, datetime

from app.core.exceptions import AppException, ForbiddenException, NotFoundException
from app.domain.enums import ReservationStatus
from app.models.reservation import Reservation
from app.models.user import User
from app.repositories.floor_repository import FloorRepository
from app.repositories.reservation_repository import ReservationRepository


class ReservationService:
    def __init__(
        self,
        reservation_repository: ReservationRepository,
        floor_repository: FloorRepository,
    ) -> None:
        self._reservation_repository = reservation_repository
        self._floor_repository = floor_repository

    async def create_reservation(
        self,
        *,
        current_user: User,
        floor_id: str,
        start_time: datetime,
        end_time: datetime,
    ) -> Reservation:
        if end_time <= start_time:
            raise AppException(
                status_code=422,
                message="Reservation end time must be greater than start time",
            )

        now = datetime.now(UTC)
        if start_time < now:
            raise AppException(
                status_code=422,
                message="Reservations in the past are not allowed",
            )

        floor = await self._floor_repository.get_by_id(floor_id)
        if not floor or floor.is_deleted:
            raise NotFoundException("Floor not found")

        overlap = await self._reservation_repository.has_overlap(
            floor_id=floor_id,
            start_time=start_time,
            end_time=end_time,
        )
        if overlap:
            raise AppException(
                status_code=409,
                message="Reservation time overlaps with an existing reservation",
            )

        reservation = Reservation(
            user_id=current_user.id,
            floor_id=floor_id,
            start_time=start_time,
            end_time=end_time,
            status=ReservationStatus.CONFIRMED,
        )
        return await self._reservation_repository.create(reservation)

    async def cancel_reservation(
        self,
        *,
        reservation_id: str,
        current_user: User,
    ) -> Reservation:
        reservation = await self._reservation_repository.get_by_id(reservation_id)
        if not reservation:
            raise NotFoundException("Reservation not found")

        is_admin = current_user.role.value in {"ADMIN", "SUPER_ADMIN"}
        if str(reservation.user_id) != str(current_user.id) and not is_admin:
            raise ForbiddenException(
                "You do not have permission to cancel this reservation"
            )

        if reservation.status == ReservationStatus.CANCELLED:
            raise AppException(status_code=409, message="Reservation already cancelled")

        return await self._reservation_repository.cancel(reservation)

    async def reservation_history(self, current_user: User) -> list[Reservation]:
        return await self._reservation_repository.list_user_history(
            str(current_user.id)
        )

    async def current_reservations(self, current_user: User) -> list[Reservation]:
        return await self._reservation_repository.list_user_current(
            user_id=str(current_user.id),
            now=datetime.now(UTC),
        )
