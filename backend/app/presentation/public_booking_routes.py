from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.core.exceptions import ValidationException
from app.dependencies.rbac import require_roles
from app.domain.enums import PublicBookingStatus
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.repositories.public_booking_repository import PublicBookingRepository
from app.schemas.public_booking import (
    PublicBookingCreateRequest,
    PublicBookingResponse,
)

router = APIRouter(prefix="/public", tags=["public"])


def generate_booking_reference() -> str:
    """Generate a unique booking reference like BK-2024-XXXXX"""
    timestamp = datetime.now().strftime("%Y")
    unique_id = str(uuid.uuid4())[:5].upper()
    return f"BK-{timestamp}-{unique_id}"


@router.post("/bookings")
async def create_booking(
    request: PublicBookingCreateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Create a new public booking (no auth required)"""
    
    # Validate time
    start_hour = int(request.start_time.split(":")[0])
    end_hour = int(request.end_time.split(":")[0])
    
    if end_hour <= start_hour:
        raise ValidationException("End time must be after start time")
    
    repository = PublicBookingRepository(session)
    
    booking_data = {
        "booking_reference": generate_booking_reference(),
        "room_id": request.room_id,
        "room_name": request.room_name,
        "plan_id": request.plan_id,
        "guest_name": request.guest_name,
        "guest_email": request.guest_email,
        "guest_phone": request.guest_phone,
        "booking_date": request.booking_date,
        "start_time": request.start_time,
        "end_time": request.end_time,
        "participants": request.participants,
        "notes": request.notes,
        "price": request.price,
        "status": PublicBookingStatus.PENDING,
        "metadata_payload": {"user_agent": "web", "source": "public_booking"},
    }
    
    booking = await repository.create(booking_data)
    await session.commit()
    
    return success_response(
        message="Booking created successfully",
        data={
            "id": str(booking.id),
            "booking_reference": booking.booking_reference,
            "status": booking.status.value,
        },
    )


@router.get("/bookings/{reference}")
async def get_booking(
    reference: str,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Get booking details by reference (no auth required)"""
    
    repository = PublicBookingRepository(session)
    booking = await repository.get_by_reference(reference)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    return success_response(
        message="Booking retrieved",
        data={
            "id": str(booking.id),
            "booking_reference": booking.booking_reference,
            "room_name": booking.room_name,
            "booking_date": booking.booking_date,
            "start_time": booking.start_time,
            "end_time": booking.end_time,
            "guest_name": booking.guest_name,
            "guest_email": booking.guest_email,
            "guest_phone": booking.guest_phone,
            "participants": booking.participants,
            "notes": booking.notes,
            "price": booking.price,
            "status": booking.status.value,
            "created_at": booking.created_at.isoformat(),
        },
    )


@router.get("/bookings")
async def list_bookings_by_email(
    email: str = Query(min_length=1),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """List bookings by guest email (no auth required)"""
    
    repository = PublicBookingRepository(session)
    bookings = await repository.list_by_email(email, skip=0, limit=50)
    
    return success_response(
        message="Bookings retrieved",
        data=[
            {
                "id": str(b.id),
                "booking_reference": b.booking_reference,
                "room_name": b.room_name,
                "booking_date": b.booking_date,
                "status": b.status.value,
                "price": b.price,
            }
            for b in bookings
        ],
    )
