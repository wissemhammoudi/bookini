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
    ContactRequestCreateRequest,
    PublicBookingCreateRequest,
    PublicBookingResponse,
)
from app.schemas.admin_workspace import ContactRequestRecord
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore

router = APIRouter(prefix="/public", tags=["public"])

def _build_public_rooms_catalog() -> list[dict[str, object]]:
    state = AdminWorkspaceStateStore.get_state()
    admin_by_organization_id = {
        user.organization_id: user.id
        for user in state.users
        if user.role == "ADMIN" and user.organization_id
    }

    rooms: list[dict[str, object]] = []
    for index, place in enumerate(state.places, start=1):
        rooms.append(
            {
                "id": index,
                "name": place.name,
                "description": place.description,
                "capacity": place.capacity,
                "price": place.pricing,
                "address": place.address,
                "availability": place.availability,
                "amenities": place.features,
                "features": place.features,
                "image": "🏢",
                "cover_image": str(place.cover_image) if place.cover_image else None,
                "gallery": [str(url) for url in place.gallery],
                # Placeholder for future admin-managed media URL.
                "video_url": None,
                "admin_id": admin_by_organization_id.get(place.organization_id),
            }
        )

    return rooms


def _time_to_minutes(value: str) -> int:
    hour, minute = value.split(":")
    return int(hour) * 60 + int(minute)


def _has_time_overlap(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    start_a_minutes = _time_to_minutes(start_a)
    end_a_minutes = _time_to_minutes(end_a)
    start_b_minutes = _time_to_minutes(start_b)
    end_b_minutes = _time_to_minutes(end_b)
    return start_a_minutes < end_b_minutes and end_a_minutes > start_b_minutes


def generate_booking_reference() -> str:
    """Generate a unique booking reference like BK-2024-XXXXX"""
    timestamp = datetime.now().strftime("%Y")
    unique_id = str(uuid.uuid4())[:5].upper()
    return f"BK-{timestamp}-{unique_id}"


@router.get("/rooms")
async def list_public_rooms() -> dict[str, object]:
    """List public room/space catalog used by booking UI."""

    return success_response(
        message="Public rooms retrieved",
        data=_build_public_rooms_catalog(),
    )


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

    existing_same_day = await repository.list_by_room_and_date_range(
        room_id=request.room_id,
        start_date=request.booking_date,
        end_date=request.booking_date,
        statuses=[PublicBookingStatus.PENDING, PublicBookingStatus.CONFIRMED],
    )

    conflicting = next(
        (
            booking
            for booking in existing_same_day
            if _has_time_overlap(
                request.start_time,
                request.end_time,
                booking.start_time,
                booking.end_time,
            )
        ),
        None,
    )
    if conflicting:
        raise ValidationException(
            f"Selected time overlaps an existing reservation ({conflicting.start_time}-{conflicting.end_time})"
        )

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


@router.get("/bookings/calendar")
async def list_booking_calendar_slots(
    room_id: int = Query(ge=1),
    start_date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Expose booked time slots by room and date range for public calendar rendering."""

    if end_date < start_date:
        raise ValidationException("end_date must be greater than or equal to start_date")

    repository = PublicBookingRepository(session)
    bookings = await repository.list_by_room_and_date_range(
        room_id=room_id,
        start_date=start_date,
        end_date=end_date,
        statuses=[PublicBookingStatus.PENDING, PublicBookingStatus.CONFIRMED],
    )

    return success_response(
        message="Calendar slots retrieved",
        data=[
            {
                "id": str(booking.id),
                "booking_reference": booking.booking_reference,
                "room_id": booking.room_id,
                "room_name": booking.room_name,
                "booking_date": booking.booking_date,
                "start_time": booking.start_time,
                "end_time": booking.end_time,
                "status": booking.status.value,
            }
            for booking in bookings
        ],
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


@router.post("/contact-requests")
async def create_contact_request(
    request: ContactRequestCreateRequest,
) -> dict[str, object]:
    """Create a public contact request and push it into admin workspace queue."""

    state = AdminWorkspaceStateStore.get_state()
    contact = ContactRequestRecord(
        id=f"contact-{uuid.uuid4().hex[:12]}",
        full_name=request.full_name,
        email=request.email,
        phone=request.phone,
        subject=request.subject,
        message=request.message,
        date=datetime.now(),
        status="PENDING",
    )
    state.contact_requests.insert(0, contact)
    AdminWorkspaceStateStore.record_activity(
        title=request.full_name,
        description="Submitted a new contact request.",
        item_type="contact",
    )

    return success_response(
        message="Contact request submitted successfully",
        data={
            "id": contact.id,
            "status": contact.status,
        },
    )
