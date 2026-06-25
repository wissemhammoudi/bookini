import hashlib
import json
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.floor import Floor
from app.models.floor_review import FloorReview
from app.models.user import User
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class PublicCatalogService:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _room_id_from_floor_id(floor_id: uuid.UUID | str) -> int:
        # Deterministic integer mapping for compatibility with public booking schema.
        if isinstance(floor_id, uuid.UUID):
            return (floor_id.int % 2_000_000_000) + 1

        try:
            parsed = uuid.UUID(floor_id)
            return (parsed.int % 2_000_000_000) + 1
        except ValueError:
            pass

        digest = hashlib.md5(str(floor_id).encode("utf-8")).hexdigest()
        return (int(digest, 16) % 2_000_000_000) + 1

    @staticmethod
    def _organization_id_from_building(building: str) -> str:
        normalized = "-".join(building.lower().split())
        return normalized or "unknown"

    @staticmethod
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

    @staticmethod
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

            area_dict = None
            if hasattr(area, "model_dump"):
                area_dict = area.model_dump()
            elif hasattr(area, "dict"):
                area_dict = area.dict()
            elif isinstance(area, dict):
                area_dict = area

            if area_dict is None:
                continue

            area_name = str(area_dict.get("name", "")).strip()
            if not area_name:
                continue

            includes_raw = area_dict.get("includes", [])
            includes = (
                [
                    str(item).strip()
                    for item in includes_raw
                    if isinstance(item, str) and str(item).strip()
                ]
                if isinstance(includes_raw, list)
                else []
            )

            geometry_raw = area_dict.get("geometry")
            geometry = geometry_raw if isinstance(geometry_raw, dict) else None
            if geometry is None and hasattr(geometry_raw, "model_dump"):
                geometry = geometry_raw.model_dump()
            elif geometry is None and hasattr(geometry_raw, "dict"):
                geometry = geometry_raw.dict()

            normalized.append(
                {
                    "name": area_name,
                    "price": float(area_dict.get("price", fallback_price) or fallback_price),
                    "includes": includes,
                    "is_reservable": area_dict.get("is_reservable", True) is not False,
                    "geometry": geometry,
                }
            )

        return normalized

    async def build_rooms_catalog(self) -> list[dict[str, object]]:
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
        result = await self.session.execute(statement)

        rooms: list[dict[str, object]] = []
        for floor, admin_name, avg_rating, rating_count in result.all():
            _ = admin_name
            organization_name = floor.building
            organization_id = self._organization_id_from_building(organization_name)
            room_id = self._room_id_from_floor_id(floor.id)
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

        state = AdminWorkspaceStateStore.get_state()
        managed_places = [
            place
            for place in state.places
            if place.id.startswith("place-") and place.organization_id.startswith("org-")
        ]

        for place in managed_places:
            related_floors = [floor for floor in state.floors if floor.place_id == place.id]
            primary_floor_id = related_floors[0].id if related_floors else place.id
            room_id = self._room_id_from_floor_id(primary_floor_id)
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
                "availability": self._format_availability(place.availability),
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
                        "reservation_areas": self._normalize_reservation_area_details(
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
