import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationException
from app.core.responses import success_response
from app.infrastructure.session import get_db_session
from app.schemas.admin_workspace import ContactRequestRecord
from app.schemas.public_booking import (
    ContactRequestCreateRequest,
    PublicBookingCreateRequest,
)
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore
from app.services.public_booking_service import PublicBookingService
from app.services.public_catalog_service import PublicCatalogService

router = APIRouter(prefix="/public", tags=["public"])


def _booking_service_from_session(session: AsyncSession) -> PublicBookingService:
    return PublicBookingService(session)


def _catalog_service_from_session(session: AsyncSession) -> PublicCatalogService:
    return PublicCatalogService(session)


@router.get("/rooms")
async def list_public_rooms(
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """List public room/space catalog used by booking UI."""
    service = _catalog_service_from_session(session)
    rooms = await service.build_rooms_catalog()
    return success_response(message="Public rooms retrieved", data=rooms)


@router.post("/bookings")
async def create_booking(
    request: PublicBookingCreateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Create a new public booking (no auth required)."""
    service = _booking_service_from_session(session)
    booking_data = await service.create_booking(request)
    return success_response(
        message="Booking created successfully",
        data=booking_data,
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
        raise ValidationException(
            "end_date must be greater than or equal to start_date"
        )

    service = _booking_service_from_session(session)
    slots = await service.list_calendar_slots(
        room_id=room_id,
        start_date=start_date,
        end_date=end_date,
    )
    return success_response(message="Calendar slots retrieved", data=slots)


@router.get("/bookings/{reference}")
async def get_booking(
    reference: str,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Get booking details by reference (no auth required)."""
    service = _booking_service_from_session(session)
    booking = await service.get_booking_by_reference(reference)

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
            "metadata_payload": booking.metadata_payload,
        },
    )


@router.get("/bookings")
async def list_bookings_by_email(
    email: str = Query(min_length=1),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """List bookings by guest email (no auth required)."""
    service = _booking_service_from_session(session)
    bookings = await service.list_bookings_by_email(email)

    return success_response(
        message="Bookings retrieved",
        data=[
            {
                "id": str(item.id),
                "booking_reference": item.booking_reference,
                "room_name": item.room_name,
                "booking_date": item.booking_date,
                "status": item.status.value,
                "price": item.price,
            }
            for item in bookings
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
