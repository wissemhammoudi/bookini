import os
from unittest.mock import AsyncMock, MagicMock
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
