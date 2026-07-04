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

from app.dependencies.auth import get_current_user  # noqa: E402
from app.domain.enums import UserRole  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


def _override_user(role: UserRole) -> SimpleNamespace:
    return SimpleNamespace(id="integration-user-id", role=role, is_active=True)


def test_statistics_summary_requires_admin_role() -> None:
    app.dependency_overrides[get_current_user] = lambda: _override_user(UserRole.USER)

    response = client.get("/api/v1/statistics/summary")

    assert response.status_code == 403
    body = response.json()
    assert body["success"] is False

    app.dependency_overrides.clear()


def test_occupancy_requires_admin_role() -> None:
    app.dependency_overrides[get_current_user] = lambda: _override_user(UserRole.USER)

    response = client.get("/api/v1/statistics/occupancy")

    assert response.status_code == 403
    body = response.json()
    assert body["success"] is False

    app.dependency_overrides.clear()
