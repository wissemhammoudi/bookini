from datetime import UTC, datetime

from fastapi import APIRouter

from app.core.responses import success_response
from app.infrastructure.readiness import readiness_snapshot

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, object]:
    payload = {
        "status": "healthy",
        "timestamp": datetime.now(UTC).isoformat(),
    }
    return success_response(message="Health check successful", data=payload)


@router.get("/ready")
async def ready() -> dict[str, object]:
    snapshot = await readiness_snapshot()
    return success_response(message="Readiness check successful", data=snapshot)
