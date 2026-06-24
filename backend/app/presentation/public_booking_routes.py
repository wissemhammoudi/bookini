import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationException
from app.core.responses import success_response
from app.domain.enums import PublicBookingStatus
from app.infrastructure.session import get_db_session
from app.models.floor import Floor
from app.models.floor_review import FloorReview
from app.models.user import User
from app.repositories.public_booking_repository import PublicBookingRepository
from app.schemas.admin_workspace import ContactRequestRecord
from app.schemas.public_booking import (
    ContactRequestCreateRequest,
    PublicBookingCreateRequest,
)
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore

router = APIRouter(prefix="/public", tags=["public"])


def _room_id_from_floor_id(floor_id: uuid.UUID) -> int:
    # Deterministic integer mapping for compatibility with public booking schema.
    return (floor_id.int % 2_000_000_000) + 1


def _organization_id_from_building(building: str) -> str:
    normalized = "-".join(building.lower().split())
    return normalized or "unknown"


def _format_availability(value: object) -> str:
    if isinstance(value, str):
        return value

    if isinstance(value, list):
        parts: list[str] = []
        for item in value:
            if isinstance(item, dict):
                day = str(item.get("day", "")).title()
                start_time = str(item.get("start_time", ""))
                end_time = str(item.get("end_time", ""))
            else:
                day = str(getattr(item, "day", "")).title()
                start_time = str(getattr(item, "start_time", ""))
                end_time = str(getattr(item, "end_time", ""))

            if day and start_time and end_time:
                parts.append(f"{day}: {start_time}-{end_time}")

        return ", ".join(parts)

    return ""


def _normalize_reservation_area_details(
    reservation_areas: object,
    fallback_price: float,
) -> list[dict[str, object]]:
    if not isinstance(reservation_areas, list):
        return []

    normalized: list[dict[str, object]] = []
    for area in reservation_areas:
        if isinstance(area, str):
            area_name = area.strip()
            if not area_name:
                continue
            normalized.append(
                {
                    "name": area_name,
                    "price": fallback_price,
                    "includes": [],
                    "is_reservable": True,
                }
            )
            continue

        if not isinstance(area, dict):
            continue

        area_name = str(area.get("name", "")).strip()
        if not area_name:
            continue

        includes_raw = area.get("includes", [])
        includes = (
            [
                str(item).strip()
                for item in includes_raw
                if isinstance(item, str) and str(item).strip()
            ]
            if isinstance(includes_raw, list)
            else []
        )

        geometry_raw = area.get("geometry")
        geometry = geometry_raw if isinstance(geometry_raw, dict) else None

        normalized.append(
            {
                "name": area_name,
                "price": float(area.get("price", fallback_price) or fallback_price),
                "includes": includes,
                "is_reservable": area.get("is_reservable", True) is not False,
                "geometry": geometry,
            }
        )

    return normalized


async def _build_public_rooms_catalog(session: AsyncSession) -> list[dict[str, object]]:
    statement = (
        select(
            Floor,
            User.full_name,
            func.coalesce(func.avg(FloorReview.rating), 0.0).label("avg_rating"),
            func.count(FloorReview.id).label("rating_count"),
        )
        .join(User, Floor.admin_id == User.id, isouter=True)
        .join(FloorReview, FloorReview.floor_id == Floor.id, isouter=True)
        .where(Floor.is_deleted.is_(False))
        .group_by(Floor.id, User.full_name)
        .order_by(Floor.created_at.desc())
    )
    result = await session.execute(statement)

    rooms: list[dict[str, object]] = []
    for floor, admin_name, avg_rating, rating_count in result.all():
        organization_name = floor.building
        organization_id = _organization_id_from_building(organization_name)
        room_id = _room_id_from_floor_id(floor.id)
        floor_name = f"{organization_name} - Floor {floor.floor_number}"

        availability = {
            "AVAILABLE": "Available",
            "OCCUPIED": "Occupied",
            "MAINTENANCE": "Under maintenance",
        }.get(floor.status.value, floor.status.value)

        rooms.append(
            {
                "id": room_id,
                "primary_floor_id": str(floor.id),
                "name": floor.name,
                "description": floor.description,
                "capacity": floor.capacity,
                "price": 0,
                "address": floor.location,
                "availability": availability,
                "amenities": [],
                "features": [],
                "image": organization_name[:1].upper() if organization_name else "B",
                "cover_image": None,
                "gallery": [],
                "video_url": None,
                "admin_id": str(floor.admin_id) if floor.admin_id else None,
                "average_rating": float(avg_rating or 0.0),
                "rating_count": int(rating_count or 0),
                "organization_id": organization_id,
                "organization_name": organization_name,
                "floors": [
                    {
                        "id": str(floor.id),
                        "floor_name": floor_name,
                        "floor_number": floor.floor_number,
                        "capacity": floor.capacity,
                        "price": 0,
                        "blueprint_image": None,
                        "description": floor.description,
                        "status": floor.status.value,
                        "reservation_areas": [],
                    }
                ],
            }
        )

    # Also include admin workspace-managed places/floors (in-memory state),
    # excluding old demo-only records that were not created by the admin UI.
    state = AdminWorkspaceStateStore.get_state()
    managed_places = [
        place
        for place in state.places
        if place.id.startswith("place-") and place.organization_id.startswith("org-")
    ]

    for place in managed_places:
        related_floors = [floor for floor in state.floors if floor.place_id == place.id]
        room_id = _room_id_from_floor_id(uuid.uuid4())
        primary_floor = related_floors[0] if related_floors else None
        organization_name = next(
            (
                org.name
                for org in state.organizations
                if org.id == place.organization_id
            ),
            place.organization_id,
        )

        room_entry = {
            "id": room_id,
            "primary_floor_id": related_floors[0].id if related_floors else None,
            "name": place.name,
            "description": place.description,
            "capacity": place.capacity,
            "price": primary_floor.pricing if primary_floor else place.pricing,
            "address": place.address,
            "availability": _format_availability(place.availability),
            "amenities": place.features,
            "features": place.features,
            "image": organization_name[:1].upper() if organization_name else "B",
            "cover_image": str(place.cover_image) if place.cover_image else None,
            "gallery": [str(item) for item in place.gallery],
            "video_url": None,
            "admin_id": None,
            "average_rating": 0.0,
            "rating_count": 0,
            "organization_id": place.organization_id,
            "organization_name": organization_name,
            "floors": [
                {
                    "id": floor.id,
                    "floor_name": floor.floor_name,
                    "floor_number": floor.floor_number,
                    "floor_size_sqm": floor.floor_size_sqm,
                    "floor_shape": floor.floor_shape,
                    "capacity": floor.capacity,
                    "price": floor.pricing,
                    "blueprint_image": floor.blueprint_image,
                    "description": floor.description,
                    "status": floor.status,
                    "reservation_areas": _normalize_reservation_area_details(
                        floor.reservation_areas,
                        float(floor.pricing),
                    ),
                }
                for floor in related_floors
            ],
        }

        if not any(
            existing["name"] == room_entry["name"]
            and existing["address"] == room_entry["address"]
            for existing in rooms
        ):
            rooms.append(room_entry)

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


def _calculate_billable_hours(start_time: str, end_time: str) -> int:
    # Keep pricing logic aligned with current frontend calculation (hour granularity).
    start_hour = int(start_time.split(":")[0])
    end_hour = int(end_time.split(":")[0])
    return max(0, end_hour - start_hour)


def _resolve_hourly_rate(
    room_entry: dict[str, object],
    selected_floor_id: str | None,
    selected_room_key: str | None = None,
) -> float:
    room_rate = float(room_entry.get("price", 0) or 0)
    floors = room_entry.get("floors", [])
    if not isinstance(floors, list) or not selected_floor_id:
        return room_rate

    matched_floor = next(
        (
            floor
            for floor in floors
            if isinstance(floor, dict) and str(floor.get("id", "")) == selected_floor_id
        ),
        None,
    )
    if not matched_floor:
        return room_rate

    floor_rate = float(matched_floor.get("price", room_rate) or room_rate)
    if not selected_room_key:
        return floor_rate

    matched_room = _resolve_blueprint_room(matched_floor, selected_room_key)
    if not matched_room:
        matched_room = _resolve_reservation_area(matched_floor, selected_room_key)
    if not matched_room:
        return floor_rate

    return float(matched_room.get("price", floor_rate) or floor_rate)


def _resolve_blueprint_room(
    floor_entry: dict[str, object],
    selected_room_key: str,
) -> dict[str, object] | None:
    blueprint_raw = floor_entry.get("blueprint_image")
    if not isinstance(blueprint_raw, str) or not blueprint_raw.strip().startswith("["):
        return None

    try:
        parsed = json.loads(blueprint_raw)
        if not isinstance(parsed, list):
            return None

        matched_room = next(
            (
                item
                for item in parsed
                if isinstance(item, dict)
                and str(item.get("name", "")) == selected_room_key
                and item.get("isReservable", True) is not False
            ),
            None,
        )
        if not matched_room:
            return None

        return matched_room
    except (TypeError, ValueError, json.JSONDecodeError):
        return None


def _resolve_reservation_area(
    floor_entry: dict[str, object],
    selected_room_key: str,
) -> dict[str, object] | None:
    reservation_areas = floor_entry.get("reservation_areas")
    if not isinstance(reservation_areas, list):
        return None

    for area in reservation_areas:
        if isinstance(area, str):
            if area == selected_room_key:
                return {
                    "name": area,
                    "price": floor_entry.get("price", 0),
                    "is_reservable": True,
                }
            continue

        if not isinstance(area, dict):
            continue

        if str(area.get("name", "")) != selected_room_key:
            continue

        if area.get("is_reservable", True) is False:
            return None

        return area

    return None


def generate_booking_reference() -> str:
    """Generate a unique booking reference like BK-2024-XXXXX"""
    timestamp = datetime.now().strftime("%Y")
    unique_id = str(uuid.uuid4())[:5].upper()
    return f"BK-{timestamp}-{unique_id}"


@router.get("/rooms")
async def list_public_rooms(
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """List public room/space catalog used by booking UI."""

    return success_response(
        message="Public rooms retrieved",
        data=await _build_public_rooms_catalog(session),
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

    public_rooms = await _build_public_rooms_catalog(session)
    selected_room = next(
        (room for room in public_rooms if int(room.get("id", -1)) == request.room_id),
        None,
    )
    if selected_room is None:
        raise ValidationException("Selected room does not exist")

    selected_floor: dict[str, object] | None = None
    if request.floor_id:
        floors = selected_room.get("floors", [])
        if isinstance(floors, list):
            selected_floor = next(
                (
                    floor
                    for floor in floors
                    if isinstance(floor, dict)
                    and str(floor.get("id", "")) == request.floor_id
                ),
                None,
            )
        if selected_floor is None:
            raise ValidationException("Selected floor does not belong to the room")

    if request.room_key and not selected_floor:
        raise ValidationException("Room selection requires a valid floor")

    if request.room_key and selected_floor:
        matched_floor_room = _resolve_blueprint_room(selected_floor, request.room_key)
        if matched_floor_room is None:
            matched_floor_room = _resolve_reservation_area(
                selected_floor, request.room_key
            )
        if matched_floor_room is None:
            raise ValidationException("Selected room does not belong to the floor")

    selected_area_keys = [
        area.strip()
        for area in (request.selected_area_keys or [])
        if isinstance(area, str) and area.strip()
    ]

    effective_booking_type = request.booking_type
    if effective_booking_type is None:
        if selected_area_keys or request.room_key:
            effective_booking_type = "SELECTED_AREAS"
        else:
            effective_booking_type = "WHOLE_FLOOR"

    if effective_booking_type == "SELECTED_AREAS" and request.room_key:
        if request.room_key not in selected_area_keys:
            selected_area_keys.append(request.room_key)

    if effective_booking_type == "SELECTED_AREAS" and not selected_floor:
        raise ValidationException("Selected areas booking requires a valid floor")

    if effective_booking_type == "SELECTED_AREAS" and not selected_area_keys:
        raise ValidationException("Selected areas booking requires at least one area")

    canonical_hourly_rate = 0.0
    resolved_area_keys: list[str] = []
    if effective_booking_type == "SELECTED_AREAS":
        assert selected_floor is not None  # guarded above
        unique_area_keys = list(dict.fromkeys(selected_area_keys))
        matched_areas: list[dict[str, object]] = []
        for area_key in unique_area_keys:
            matched_area = _resolve_blueprint_room(selected_floor, area_key)
            if matched_area is None:
                matched_area = _resolve_reservation_area(selected_floor, area_key)
            if matched_area is None:
                raise ValidationException(
                    f"Selected area '{area_key}' does not belong to the floor"
                )
            matched_areas.append(matched_area)

        floor_rate = float(
            selected_floor.get("price", selected_room.get("price", 0))
            or selected_room.get("price", 0)
            or 0
        )
        canonical_hourly_rate = sum(
            float(area.get("price", floor_rate) or floor_rate) for area in matched_areas
        )
        resolved_area_keys = unique_area_keys
    else:
        canonical_hourly_rate = _resolve_hourly_rate(
            selected_room,
            request.floor_id,
            request.room_key,
        )

    billable_hours = _calculate_billable_hours(request.start_time, request.end_time)
    expected_price = round(canonical_hourly_rate * billable_hours, 2)
    submitted_price = round(float(request.price), 2)
    if abs(submitted_price - expected_price) > 0.01:
        mismatch_message = (
            "Price mismatch. "
            f"Expected {expected_price:.2f} based on selected booking scope"
        )
        raise ValidationException(mismatch_message)

    canonical_room_name = str(selected_room.get("name", request.room_name))
    if selected_floor and selected_floor.get("floor_name"):
        canonical_room_name = f"{canonical_room_name} - {selected_floor['floor_name']}"
    if effective_booking_type == "SELECTED_AREAS" and resolved_area_keys:
        canonical_room_name = (
            f"{canonical_room_name} - {len(resolved_area_keys)} area"
            f"{'s' if len(resolved_area_keys) > 1 else ''}"
        )
    elif request.room_key:
        canonical_room_name = f"{canonical_room_name} - {request.room_key}"

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
            "Selected time overlaps an existing reservation"
            f" ({conflicting.start_time}-{conflicting.end_time})"
        )

    booking_data = {
        "booking_reference": generate_booking_reference(),
        "room_id": request.room_id,
        "room_name": canonical_room_name,
        "plan_id": request.plan_id,
        "guest_name": request.guest_name,
        "guest_email": request.guest_email,
        "guest_phone": request.guest_phone,
        "booking_date": request.booking_date,
        "start_time": request.start_time,
        "end_time": request.end_time,
        "participants": request.participants,
        "notes": request.notes,
        "price": expected_price,
        "status": PublicBookingStatus.PENDING,
        "metadata_payload": {
            "user_agent": "web",
            "source": "public_booking",
            "floor_id": request.floor_id,
            "booking_type": effective_booking_type,
            "room_key": request.room_key,
            "selected_area_keys": resolved_area_keys,
            "submitted_price": submitted_price,
            "canonical_hourly_rate": canonical_hourly_rate,
            "billable_hours": billable_hours,
        },
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
        raise ValidationException(
            "end_date must be greater than or equal to start_date"
        )

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
