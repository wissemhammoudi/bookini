import os

from fastapi.testclient import TestClient

os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test_db"
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from app.main import app
from app.presentation import health_routes

client = TestClient(app)


def test_health_endpoint_returns_standard_success_envelope() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert body["message"] == "Health check successful"
    assert body["data"]["status"] == "healthy"
    assert "timestamp" in body["data"]


def test_ready_endpoint_returns_standard_success_envelope(monkeypatch) -> None:
    async def fake_readiness_snapshot() -> dict[str, object]:
        return {
            "status": "ready",
            "timestamp": "2026-06-29T00:00:00+00:00",
            "checks": {
                "database": {"ready": True, "detail": "ok"},
                "redis": {"ready": True, "detail": "ok"},
            },
        }

    monkeypatch.setattr(health_routes, "readiness_snapshot", fake_readiness_snapshot)

    response = client.get("/api/v1/ready")

    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert body["message"] == "Readiness check successful"
    assert body["data"]["status"] == "ready"
    assert "checks" in body["data"]
