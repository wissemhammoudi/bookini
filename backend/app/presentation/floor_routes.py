from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.domain.enums import FloorStatus
from app.infrastructure.session import get_db_session
from app.models.floor import Floor
from app.models.user import User
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.floor_repository import FloorRepository
from app.services.audit_log_service import AuditLogService
from app.services.floor_service import FloorService

router = APIRouter(prefix="/floors", tags=["floors"])


def _service_from_session(session: AsyncSession) -> FloorService:
    return FloorService(FloorRepository(session))


def _audit_service_from_session(session: AsyncSession) -> AuditLogService:
    return AuditLogService(AuditLogRepository(session))


def _client_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _serialize_floor(floor: Floor) -> dict[str, object]:
    return {
        "id": str(floor.id),
        "admin_id": str(floor.admin_id) if floor.admin_id else None,
        "name": floor.name,
        "capacity": floor.capacity,
        "building": floor.building,
        "floor_number": floor.floor_number,
        "location": floor.location,
        "description": floor.description,
        "status": floor.status.value,
        "is_deleted": floor.is_deleted,
    }


@router.get("")
async def list_floors(
    search: str | None = Query(default=None),
    status: FloorStatus | None = Query(default=None),
    building: str | None = Query(default=None),
    floor_number: int | None = Query(default=None),
    include_deleted: bool = Query(default=False),
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    floors = await service.list_floors(
        search=search,
        status=status,
        building=building,
        floor_number=floor_number,
        include_deleted=include_deleted,
    )
    data = [_serialize_floor(item) for item in floors]
    return success_response(message="Floors retrieved successfully", data=data)
