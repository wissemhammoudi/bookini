from types import SimpleNamespace

import pytest

from app.core.exceptions import ForbiddenException, NotFoundException
from app.domain.enums import UserRole
from app.services.activity_service import ActivityService


class FakeActivityRepository:
    def __init__(
        self,
        activity: object | None = None,
        activities: list[object] | None = None,
    ) -> None:
        self._activity = activity
        self._activities = activities or []
        self.deleted = False

    async def create(self, activity: object) -> object:
        return activity

    async def get_by_id(self, _: str) -> object | None:
        return self._activity

    async def list_by_reservation(self, _: str) -> list[object]:
        return self._activities


class FakeReservationRepository:
    def __init__(self, reservation: object | None = None) -> None:
        self._reservation = reservation

    async def get_by_id(self, _: str) -> object | None:
        return self._reservation


def _user(role: UserRole = UserRole.USER, user_id: str = "user-1") -> SimpleNamespace:
    return SimpleNamespace(id=user_id, role=role)


@pytest.mark.asyncio
async def test_create_activity_rejects_missing_reservation() -> None:
    service = ActivityService(
        activity_repository=FakeActivityRepository(),
        reservation_repository=FakeReservationRepository(reservation=None),
    )

    with pytest.raises(NotFoundException):
        await service.create_activity(
            current_user=_user(),
            reservation_id="missing",
            title="Activity",
            description="desc",
        )


@pytest.mark.asyncio
async def test_create_activity_rejects_non_owner_non_admin() -> None:
    reservation = SimpleNamespace(id="r1", user_id="another-user")
    service = ActivityService(
        activity_repository=FakeActivityRepository(),
        reservation_repository=FakeReservationRepository(reservation=reservation),
    )

    with pytest.raises(ForbiddenException):
        await service.create_activity(
            current_user=_user(),
            reservation_id="r1",
            title="Activity",
            description="desc",
        )


@pytest.mark.asyncio
async def test_create_activity_allows_owner() -> None:
    reservation = SimpleNamespace(id="r1", user_id="user-1")
    service = ActivityService(
        activity_repository=FakeActivityRepository(),
        reservation_repository=FakeReservationRepository(reservation=reservation),
    )

    activity = await service.create_activity(
        current_user=_user(),
        reservation_id="r1",
        title="Activity",
        description="desc",
    )

    assert activity.title == "Activity"
    assert str(activity.reservation_id) == "r1"


@pytest.mark.asyncio
async def test_list_activities_denies_non_owner_non_admin() -> None:
    reservation = SimpleNamespace(id="r1", user_id="another-user")
    activity_repo = FakeActivityRepository(activities=[SimpleNamespace(id="a1")])
    service = ActivityService(
        activity_repository=activity_repo,
        reservation_repository=FakeReservationRepository(reservation=reservation),
    )

    with pytest.raises(ForbiddenException):
        await service.list_activities(current_user=_user(), reservation_id="r1")
