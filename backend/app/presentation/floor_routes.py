from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import require_roles
from app.domain.enums import FloorStatus
from app.infrastructure.session import get_db_session
from app.models.floor import Floor
from app.models.user import User
from app.repositories.floor_repository import FloorRepository
from app.schemas.floor import FloorCreateRequest, FloorUpdateRequest
from app.services.floor_service import FloorService

router = APIRouter(prefix="/floors", tags=["floors"])


def _service_from_session(session: AsyncSession) -> FloorService:
    return FloorService(FloorRepository(session))


def _serialize_floor(floor: Floor) -> dict[str, object]:
    return {
        "id": str(floor.id),
        "name": floor.name,
        "capacity": floor.capacity,
        "building": floor.building,
        "floor_number": floor.floor_number,
        "location": floor.location,
        "description": floor.description,
        "status": floor.status.value,
        "is_deleted": floor.is_deleted,
    }


@router.post("")
async def create_floor(
    payload: FloorCreateRequest,
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    floor = await service.create_floor(**payload.model_dump())
    return success_response(
        message="Floor created successfully", data=_serialize_floor(floor)
    )


@router.put("/{floor_id}")
async def update_floor(
    floor_id: str,
    payload: FloorUpdateRequest,
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    floor = await service.update_floor(floor_id=floor_id, payload=payload.model_dump())
    return success_response(
        message="Floor updated successfully", data=_serialize_floor(floor)
    )


@router.delete("/{floor_id}")
async def delete_floor(
    floor_id: str,
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    floor = await service.delete_floor(floor_id=floor_id)
    return success_response(
        message="Floor deleted successfully",
        data={"id": str(floor.id), "is_deleted": floor.is_deleted},
    )


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
