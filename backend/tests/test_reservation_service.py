from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest

from app.core.exceptions import AppException, ForbiddenException, NotFoundException
from app.domain.enums import ReservationStatus, UserRole
from app.services.reservation_service import ReservationService


class FakeFloorRepository:
    def __init__(self, floor: object | None) -> None:
        self._floor = floor

    async def get_by_id(self, _: str) -> object | None:
        return self._floor


class FakeReservationRepository:
    def __init__(
        self, *, overlap: bool = False, reservation: object | None = None
    ) -> None:
        self._overlap = overlap
        self._reservation = reservation

    async def has_overlap(self, **_: object) -> bool:
        return self._overlap

    async def create(self, reservation: object) -> object:
        return reservation

    async def get_by_id(self, _: str) -> object | None:
        return self._reservation

    async def cancel(self, reservation: object) -> object:
        reservation.status = ReservationStatus.CANCELLED
        return reservation

    async def list_user_history(self, _: str) -> list[object]:
        return []

    async def list_user_current(self, user_id: str, now: datetime) -> list[object]:
        _ = (user_id, now)
        return []


def _user(role: UserRole = UserRole.USER) -> SimpleNamespace:
    return SimpleNamespace(id="user-1", role=role)


@pytest.mark.asyncio
async def test_create_reservation_rejects_invalid_time_range() -> None:
    service = ReservationService(
        reservation_repository=FakeReservationRepository(),
        floor_repository=FakeFloorRepository(floor=SimpleNamespace(is_deleted=False)),
    )

    now = datetime.now(UTC)
    with pytest.raises(AppException):
        await service.create_reservation(
            current_user=_user(),
            floor_id="floor-1",
            start_time=now,
            end_time=now,
        )


@pytest.mark.asyncio
async def test_create_reservation_rejects_past_start_time() -> None:
    service = ReservationService(
        reservation_repository=FakeReservationRepository(),
        floor_repository=FakeFloorRepository(floor=SimpleNamespace(is_deleted=False)),
    )

    start_time = datetime.now(UTC) - timedelta(hours=2)
    end_time = start_time + timedelta(hours=1)
    with pytest.raises(AppException):
        await service.create_reservation(
            current_user=_user(),
            floor_id="floor-1",
            start_time=start_time,
            end_time=end_time,
        )


@pytest.mark.asyncio
async def test_create_reservation_rejects_missing_floor() -> None:
    service = ReservationService(
        reservation_repository=FakeReservationRepository(),
        floor_repository=FakeFloorRepository(floor=None),
    )

    now = datetime.now(UTC)
    with pytest.raises(NotFoundException):
        await service.create_reservation(
            current_user=_user(),
            floor_id="floor-1",
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=2),
        )


@pytest.mark.asyncio
async def test_create_reservation_rejects_overlap() -> None:
    service = ReservationService(
        reservation_repository=FakeReservationRepository(overlap=True),
        floor_repository=FakeFloorRepository(floor=SimpleNamespace(is_deleted=False)),
    )

    now = datetime.now(UTC)
    with pytest.raises(AppException):
        await service.create_reservation(
            current_user=_user(),
            floor_id="floor-1",
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=2),
        )


@pytest.mark.asyncio
async def test_cancel_reservation_denies_non_owner_non_admin() -> None:
    reservation = SimpleNamespace(
        user_id="another-user", status=ReservationStatus.CONFIRMED
    )
    service = ReservationService(
        reservation_repository=FakeReservationRepository(reservation=reservation),
        floor_repository=FakeFloorRepository(floor=SimpleNamespace(is_deleted=False)),
    )

    with pytest.raises(ForbiddenException):
        await service.cancel_reservation(reservation_id="r1", current_user=_user())
