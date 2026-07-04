import os
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test_db"
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from app.infrastructure.session import get_db_session
from app.main import app
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore

client = TestClient(app)


async def _mock_db_session():
    session = MagicMock()
    mock_result = MagicMock()
    mock_result.all.return_value = []
    session.execute = AsyncMock(return_value=mock_result)
    session.commit = AsyncMock()
    yield session


def test_public_rooms_catalog_contains_reservation_areas() -> None:
    app.dependency_overrides[get_db_session] = _mock_db_session

    # Trigger loading/building state
    state = AdminWorkspaceStateStore.get_state()
    assert len(state.floors) > 0

    response = client.get("/api/v1/public/rooms")
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert "data" in body

    # Find the Marseille Innovation Lab space (from the mock data)
    marseille_space = next(
        (room for room in body["data"] if room["name"] == "Marseille Innovation Lab"),
        None,
    )
    assert marseille_space is not None

    # Check that it has floors and reservation_areas
    assert len(marseille_space["floors"]) > 0
    creative_floor = next(
        (f for f in marseille_space["floors"] if f["floor_name"] == "Creative Floor"),
        None,
    )
    assert creative_floor is not None

    # Verify that the reservation areas are populated correctly (not empty)
    areas = creative_floor["reservation_areas"]
    assert len(areas) == 2
    assert any(a["name"] == "Design Studio" for a in areas)
    assert any(a["name"] == "Coding Hub" for a in areas)

    # Double check keys on Design Studio
    design_studio = next(a for a in areas if a["name"] == "Design Studio")
    assert design_studio["price"] == 10.0
    assert "Projector" in design_studio["includes"]
    assert design_studio["is_reservable"] is True

    app.dependency_overrides.clear()


def test_create_multiday_booking_with_discounts() -> None:
    app.dependency_overrides[get_db_session] = _mock_db_session
    state = AdminWorkspaceStateStore.get_state()
    assert len(state.floors) > 0

    response = client.get("/api/v1/public/rooms")
    assert response.status_code == 200
    rooms = response.json()["data"]
    marseille = next(r for r in rooms if r["name"] == "Marseille Innovation Lab")
    room_id = marseille["id"]
    floor_id = marseille["floors"][0]["id"]
    hourly_rate = marseille["floors"][0]["price"] or 15.0

    # 3 days: 10% discount. 9:00 to 18:00 (9 hours)
    hours = 9
    base_price = hourly_rate * hours * 3
    discounted_price = round(base_price * 0.90, 2)

    from app.repositories.public_booking_repository import PublicBookingRepository

    async def dummy_list(*args, **kwargs):
        return []

    dummy_booking = MagicMock()
    dummy_booking.id = "d8af0f02-f0cf-41b6-a3a7-c33692f8b261"
    dummy_booking.booking_reference = "BK-2026-TEST"
    dummy_booking.status.value = "PENDING"

    async def dummy_create(booking_data):
        assert booking_data["price"] == discounted_price
        assert booking_data["metadata_payload"]["end_date"] == "2026-06-27"
        assert booking_data["metadata_payload"]["number_of_days"] == 3
        assert booking_data["metadata_payload"]["discount_applied"] == 0.10
        return dummy_booking

    with (
        patch.object(
            PublicBookingRepository,
            "list_by_room_and_date_range",
            side_effect=dummy_list,
        ),
        patch.object(PublicBookingRepository, "create", side_effect=dummy_create),
    ):
        payload = {
            "room_id": room_id,
            "floor_id": floor_id,
            "room_name": "Marseille Innovation Lab",
            "plan_id": "standard",
            "guest_name": "Test Guest",
            "guest_email": "guest@example.com",
            "guest_phone": "1234567890",
            "booking_date": "2026-06-25",
            "end_date": "2026-06-27",
            "start_time": "09:00",
            "end_time": "18:00",
            "participants": 5,
            "price": discounted_price,
        }
        resp = client.post("/api/v1/public/bookings", json=payload)
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["data"]["booking_reference"] == "BK-2026-TEST"

    app.dependency_overrides.clear()
