import os

from fastapi.testclient import TestClient

os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test_db"
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from app.main import app

client = TestClient(app)


def test_unknown_route_returns_standard_error_envelope() -> None:
    response = client.get("/api/v1/route-that-does-not-exist")

    assert response.status_code == 404

    body = response.json()
    assert body["success"] is False
    assert body["message"] == "Request failed"
    assert isinstance(body["errors"], list)
    assert len(body["errors"]) == 1
