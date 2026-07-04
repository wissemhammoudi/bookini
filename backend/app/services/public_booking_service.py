import json
import uuid
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationException
from app.domain.enums import PublicBookingStatus
from app.repositories.public_booking_repository import PublicBookingRepository
from app.schemas.public_booking import PublicBookingCreateRequest
from app.services.public_catalog_service import PublicCatalogService


class PublicBookingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = PublicBookingRepository(session)
        self.catalog_service = PublicCatalogService(session)

    @staticmethod
    def _time_to_minutes(value: str) -> int:
        hour, minute = value.split(":")
        return int(hour) * 60 + int(minute)

    @classmethod
    def _has_time_overlap(
        cls,
        start_a: str,
        end_a: str,
        start_b: str,
        end_b: str,
    ) -> bool:
        start_a_minutes = cls._time_to_minutes(start_a)
        end_a_minutes = cls._time_to_minutes(end_a)
        start_b_minutes = cls._time_to_minutes(start_b)
        end_b_minutes = cls._time_to_minutes(end_b)
        return start_a_minutes < end_b_minutes and end_a_minutes > start_b_minutes

    @staticmethod
    def _calculate_billable_hours(start_time: str, end_time: str) -> int:
        # Keep pricing logic aligned with current frontend
        # calculation (hour granularity).
        start_hour = int(start_time.split(":")[0])
        end_hour = int(end_time.split(":")[0])
        return max(0, end_hour - start_hour)

    @staticmethod
    def _resolve_blueprint_room(
        floor_entry: dict[str, object],
        selected_room_key: str,
    ) -> dict[str, object] | None:
        blueprint_raw = floor_entry.get("blueprint_image")
        if not isinstance(blueprint_raw, str) or not blueprint_raw.strip().startswith(
            "["
        ):
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

    @staticmethod
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

    def _resolve_hourly_rate(
        self,
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
                if isinstance(floor, dict)
                and str(floor.get("id", "")) == selected_floor_id
            ),
            None,
        )
        if not matched_floor:
            return room_rate

        floor_rate = float(matched_floor.get("price", room_rate) or room_rate)
        if not selected_room_key:
            return floor_rate

        matched_room = self._resolve_blueprint_room(matched_floor, selected_room_key)
        if not matched_room:
            matched_room = self._resolve_reservation_area(
                matched_floor, selected_room_key
            )
        if not matched_room:
            return floor_rate

        return float(matched_room.get("price", floor_rate) or floor_rate)

    @staticmethod
    def _generate_booking_reference() -> str:
        timestamp = datetime.now().strftime("%Y")
        unique_id = str(uuid.uuid4())[:5].upper()
        return f"BK-{timestamp}-{unique_id}"

    async def create_booking(
        self, request: PublicBookingCreateRequest
    ) -> dict[str, str]:
        start_hour = int(request.start_time.split(":")[0])
        end_hour = int(request.end_time.split(":")[0])

        if end_hour <= start_hour:
            raise ValidationException("End time must be after start time")

        public_rooms = await self.catalog_service.build_rooms_catalog()
        selected_room = next(
            (
                room
                for room in public_rooms
                if int(room.get("id", -1)) == request.room_id
            ),
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
            matched_floor_room = self._resolve_blueprint_room(
                selected_floor, request.room_key
            )
            if matched_floor_room is None:
                matched_floor_room = self._resolve_reservation_area(
                    selected_floor,
                    request.room_key,
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
            raise ValidationException(
                "Selected areas booking requires at least one area"
            )

        canonical_hourly_rate = 0.0
        resolved_area_keys: list[str] = []
        if effective_booking_type == "SELECTED_AREAS":
            assert selected_floor is not None
            unique_area_keys = list(dict.fromkeys(selected_area_keys))
            matched_areas: list[dict[str, object]] = []
            for area_key in unique_area_keys:
                matched_area = self._resolve_blueprint_room(selected_floor, area_key)
                if matched_area is None:
                    matched_area = self._resolve_reservation_area(
                        selected_floor, area_key
                    )
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
                float(area.get("price", floor_rate) or floor_rate)
                for area in matched_areas
            )
            resolved_area_keys = unique_area_keys
        else:
            canonical_hourly_rate = self._resolve_hourly_rate(
                selected_room,
                request.floor_id,
                request.room_key,
            )

        number_of_days = 1
        discount_applied = 0.0
        if request.end_date and request.end_date.strip():
            try:
                start_dt = datetime.strptime(request.booking_date, "%Y-%m-%d")
                end_dt = datetime.strptime(request.end_date, "%Y-%m-%d")
                number_of_days = (end_dt - start_dt).days + 1
                if number_of_days < 1:
                    raise ValidationException(
                        "End date must be on or after booking date"
                    )
            except ValueError:
                raise ValidationException("Invalid date format. Use YYYY-MM-DD")

        if number_of_days >= 30:
            discount_applied = 0.50
        elif number_of_days >= 6:
            discount_applied = 0.20
        elif number_of_days >= 3:
            discount_applied = 0.10

        billable_hours = self._calculate_billable_hours(
            request.start_time, request.end_time
        )
        base_total = canonical_hourly_rate * billable_hours * number_of_days
        expected_price = round(base_total * (1.0 - discount_applied), 2)
        submitted_price = round(float(request.price), 2)
        if abs(submitted_price - expected_price) > 0.01:
            mismatch_message = (
                "Price mismatch. "
                f"Expected {expected_price:.2f} based on selected booking scope"
            )
            raise ValidationException(mismatch_message)

        canonical_room_name = str(selected_room.get("name", request.room_name))
        if selected_floor and selected_floor.get("floor_name"):
            canonical_room_name = (
                f"{canonical_room_name} - {selected_floor['floor_name']}"
            )
        if effective_booking_type == "SELECTED_AREAS" and resolved_area_keys:
            canonical_room_name = (
                f"{canonical_room_name} - {len(resolved_area_keys)} area"
                f"{'s' if len(resolved_area_keys) > 1 else ''}"
            )
        elif request.room_key:
            canonical_room_name = f"{canonical_room_name} - {request.room_key}"

        query_end_date = (
            request.end_date
            if (request.end_date and request.end_date.strip())
            else request.booking_date
        )
        existing_bookings = await self.repository.list_by_room_and_date_range(
            room_id=request.room_id,
            start_date=request.booking_date,
            end_date=query_end_date,
            statuses=[PublicBookingStatus.PENDING, PublicBookingStatus.CONFIRMED],
        )

        conflicting = next(
            (
                booking
                for booking in existing_bookings
                if self._has_time_overlap(
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
            "booking_reference": self._generate_booking_reference(),
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
                "end_date": (
                    request.end_date
                    if (request.end_date and request.end_date.strip())
                    else None
                ),
                "number_of_days": number_of_days,
                "discount_applied": discount_applied,
            },
        }

        booking = await self.repository.create(booking_data)
        await self.session.commit()

        return {
            "id": str(booking.id),
            "booking_reference": booking.booking_reference,
            "status": booking.status.value,
        }

    async def list_calendar_slots(
        self,
        room_id: int,
        start_date: str,
        end_date: str,
    ) -> list[dict[str, object]]:
        bookings = await self.repository.list_by_room_and_date_range(
            room_id=room_id,
            start_date=start_date,
            end_date=end_date,
            statuses=[PublicBookingStatus.PENDING, PublicBookingStatus.CONFIRMED],
        )

        slots: list[dict[str, object]] = []
        for booking in bookings:
            b_start = booking.booking_date
            b_end = (booking.metadata_payload or {}).get("end_date") or b_start
            try:
                b_start_dt = datetime.strptime(b_start, "%Y-%m-%d")
                b_end_dt = datetime.strptime(b_end, "%Y-%m-%d")
                curr = b_start_dt
                while curr <= b_end_dt:
                    curr_str = curr.strftime("%Y-%m-%d")
                    if start_date <= curr_str <= end_date:
                        slots.append(
                            {
                                "id": str(booking.id),
                                "booking_reference": booking.booking_reference,
                                "room_id": booking.room_id,
                                "room_name": booking.room_name,
                                "booking_date": curr_str,
                                "start_time": booking.start_time,
                                "end_time": booking.end_time,
                                "status": booking.status.value,
                            }
                        )
                    curr += timedelta(days=1)
            except ValueError:
                if start_date <= b_start <= end_date:
                    slots.append(
                        {
                            "id": str(booking.id),
                            "booking_reference": booking.booking_reference,
                            "room_id": booking.room_id,
                            "room_name": booking.room_name,
                            "booking_date": b_start,
                            "start_time": booking.start_time,
                            "end_time": booking.end_time,
                            "status": booking.status.value,
                        }
                    )

        return slots

    async def get_booking_by_reference(self, reference: str):
        return await self.repository.get_by_reference(reference)

    async def list_bookings_by_email(self, email: str):
        return await self.repository.list_by_email(email, skip=0, limit=50)
