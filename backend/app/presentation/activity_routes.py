from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.infrastructure.session import get_db_session
from app.models.activity import Activity
from app.models.user import User
from app.repositories.activity_repository import ActivityRepository
from app.repositories.reservation_repository import ReservationRepository
from app.schemas.activity import ActivityCreateRequest
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/activities", tags=["activities"])


def _service_from_session(session: AsyncSession) -> ActivityService:
    return ActivityService(
        activity_repository=ActivityRepository(session),
        reservation_repository=ReservationRepository(session),
    )


def _serialize_activity(item: Activity) -> dict[str, object]:
    return {
        "id": str(item.id),
        "reservation_id": str(item.reservation_id),
        "title": item.title,
        "description": item.description,
        "created_at": item.created_at.isoformat(),
    }


@router.post("")
async def create_activity(
    payload: ActivityCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    activity = await service.create_activity(
        current_user=current_user,
        reservation_id=payload.reservation_id,
        title=payload.title,
        description=payload.description,
    )
    return success_response(
        message="Activity created successfully", data=_serialize_activity(activity)
    )


@router.get("/reservation/{reservation_id}")
async def list_activities(
    reservation_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    activities = await service.list_activities(
        current_user=current_user,
        reservation_id=reservation_id,
    )
    return success_response(
        message="Activities retrieved successfully",
        data=[_serialize_activity(item) for item in activities],
    )
