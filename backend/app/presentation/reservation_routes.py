from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.infrastructure.session import get_db_session
from app.models.reservation import Reservation
from app.models.user import User
from app.repositories.floor_repository import FloorRepository
from app.repositories.reservation_repository import ReservationRepository
from app.schemas.reservation import ReservationCreateRequest
from app.services.reservation_service import ReservationService

from ..dependencies.auth import get_current_user

router = APIRouter(prefix="/reservations", tags=["reservations"])


def _service_from_session(session: AsyncSession) -> ReservationService:
    return ReservationService(
        reservation_repository=ReservationRepository(session),
        floor_repository=FloorRepository(session),
    )


def _serialize_reservation(item: Reservation) -> dict[str, object]:
    return {
        "id": str(item.id),
        "user_id": str(item.user_id),
        "floor_id": str(item.floor_id),
        "start_time": item.start_time.isoformat(),
        "end_time": item.end_time.isoformat(),
        "status": item.status.value,
    }


@router.post("")
async def create_reservation(
    payload: ReservationCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    reservation = await service.create_reservation(
        current_user=current_user,
        floor_id=payload.floor_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    return success_response(
        message="Reservation created successfully",
        data=_serialize_reservation(reservation),
    )


@router.post("/{reservation_id}/cancel")
async def cancel_reservation(
    reservation_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    reservation = await service.cancel_reservation(
        reservation_id=reservation_id,
        current_user=current_user,
    )
    return success_response(
        message="Reservation cancelled successfully",
        data=_serialize_reservation(reservation),
    )


@router.get("/history")
async def reservation_history(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    reservations = await service.reservation_history(current_user)
    data = [_serialize_reservation(item) for item in reservations]
    return success_response(message="Reservation history retrieved", data=data)


@router.get("/current")
async def current_reservations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    reservations = await service.current_reservations(current_user)
    data = [_serialize_reservation(item) for item in reservations]
    return success_response(message="Current reservations retrieved", data=data)
