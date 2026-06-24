import os
from types import SimpleNamespace

from fastapi.testclient import TestClient

os.environ.setdefault(
    "DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/test"
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SECRET_KEY", "test-secret-key-with-minimum-length")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "7")

from unittest.mock import AsyncMock, MagicMock

from app.dependencies.auth import get_current_user  # noqa: E402
from app.domain.enums import UserRole  # noqa: E402
from app.infrastructure.session import get_db_session  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


async def _mock_db_session():
    session = MagicMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    yield session


def _override_user(
    user_id: str = "12345678-1234-5678-1234-567812345678",
    full_name: str = "Test User",
    role: UserRole = UserRole.USER,
) -> SimpleNamespace:
    return SimpleNamespace(id=user_id, full_name=full_name, role=role, is_active=True)


def test_in_memory_floor_reviews_lifecycle() -> None:
    app.dependency_overrides[get_db_session] = _mock_db_session

    # 1. Ensure initial reviews list is empty
    floor_id = "floor-test-1"
    response = client.get(f"/api/v1/floors/{floor_id}/reviews")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["average_rating"] == 0.0
    assert body["data"]["rating_count"] == 0
    assert len(body["data"]["reviews"]) == 0

    # 2. Upsert a review
    app.dependency_overrides[get_current_user] = lambda: _override_user()
    review_payload = {"rating": 4, "comment": "Great place!"}
    response = client.post(f"/api/v1/floors/{floor_id}/reviews/me", json=review_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["rating"] == 4
    assert body["data"]["comment"] == "Great place!"
    assert body["data"]["user_id"] == "12345678-1234-5678-1234-567812345678"

    # 3. Retrieve review and verify aggregate values
    response = client.get(f"/api/v1/floors/{floor_id}/reviews")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["average_rating"] == 4.0
    assert body["data"]["rating_count"] == 1
    assert len(body["data"]["reviews"]) == 1
    assert body["data"]["reviews"][0]["comment"] == "Great place!"

    # 4. Update the review
    update_payload = {"rating": 5, "comment": "Actually, it is perfect!"}
    response = client.post(f"/api/v1/floors/{floor_id}/reviews/me", json=update_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["rating"] == 5
    assert body["data"]["comment"] == "Actually, it is perfect!"

    # Verify updated aggregates
    response = client.get(f"/api/v1/floors/{floor_id}/reviews")
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["average_rating"] == 5.0
    assert body["data"]["rating_count"] == 1

    # 5. Delete the review
    response = client.delete(f"/api/v1/floors/{floor_id}/reviews/me")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True

    # Verify empty again
    response = client.get(f"/api/v1/floors/{floor_id}/reviews")
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["average_rating"] == 0.0
    assert body["data"]["rating_count"] == 0
    assert len(body["data"]["reviews"]) == 0

    app.dependency_overrides.clear()
