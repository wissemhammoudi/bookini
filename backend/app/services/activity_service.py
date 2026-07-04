from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.activity import Activity
from app.models.user import User
from app.repositories.activity_repository import ActivityRepository
from app.repositories.reservation_repository import ReservationRepository


class ActivityService:
    def __init__(
        self,
        activity_repository: ActivityRepository,
        reservation_repository: ReservationRepository,
    ) -> None:
        self._activity_repository = activity_repository
        self._reservation_repository = reservation_repository

    async def create_activity(
        self,
        *,
        current_user: User,
        reservation_id: str,
        title: str,
        description: str | None,
    ) -> Activity:
        reservation = await self._reservation_repository.get_by_id(reservation_id)
        if not reservation:
            raise NotFoundException("Reservation not found")

        is_admin = current_user.role.value in {"ADMIN", "SUPER_ADMIN"}
        if str(reservation.user_id) != str(current_user.id) and not is_admin:
            raise ForbiddenException(
                "You do not have permission to modify this reservation"
            )

        activity = Activity(
            reservation_id=reservation.id,
            title=title,
            description=description,
        )
        return await self._activity_repository.create(activity)

    async def list_activities(
        self, *, current_user: User, reservation_id: str
    ) -> list[Activity]:
        reservation = await self._reservation_repository.get_by_id(reservation_id)
        if not reservation:
            raise NotFoundException("Reservation not found")

        is_admin = current_user.role.value in {"ADMIN", "SUPER_ADMIN"}
        if str(reservation.user_id) != str(current_user.id) and not is_admin:
            raise ForbiddenException(
                "You do not have permission to view these activities"
            )

        return await self._activity_repository.list_by_reservation(reservation_id)
