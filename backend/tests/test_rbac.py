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
    return SimpleNamespace(id="test-user-id", role=role, is_active=True)


def test_admin_route_denies_regular_user() -> None:
    app.dependency_overrides[get_current_user] = lambda: _override_user(UserRole.USER)

    response = client.get("/api/v1/admin/dashboard")

    assert response.status_code == 403
    body = response.json()
    assert body["success"] is False
    assert body["message"] == "Insufficient permissions for this operation"

    app.dependency_overrides.clear()


def test_admin_route_allows_admin_user() -> None:
    app.dependency_overrides[get_current_user] = lambda: _override_user(UserRole.ADMIN)

    response = client.get("/api/v1/admin/dashboard")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["permissions_scope"] == "admin"

    app.dependency_overrides.clear()


def test_super_admin_route_denies_admin_user() -> None:
    app.dependency_overrides[get_current_user] = lambda: _override_user(UserRole.ADMIN)

    response = client.get("/api/v1/admin/super-admin/settings")

    assert response.status_code == 403
    body = response.json()
    assert body["success"] is False

    app.dependency_overrides.clear()


def test_super_admin_route_allows_super_admin_user() -> None:
    app.dependency_overrides[get_current_user] = lambda: _override_user(
        UserRole.SUPER_ADMIN
    )

    response = client.get("/api/v1/admin/super-admin/settings")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["permissions_scope"] == "super_admin"

    app.dependency_overrides.clear()
