import hashlib
import uuid

import redis.asyncio as aioredis
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.cache import get_cached, set_cached
from app.models.floor import Floor
from app.models.floor_review import FloorReview
from app.models.user import User
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore

_CATALOG_CACHE_KEY = "bookini:catalog:rooms"
_CATALOG_CACHE_TTL = 30  # seconds

_MEDIA_PRESETS: dict[str, dict[str, object]] = {
    "main-coworking-space": {
        "cover_image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        ],
        "video_url": "https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=0&rel=0",
    },
    "silent-focus-room": {
        "cover_image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        ],
        "video_url": "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&rel=0",
    },
    "creative-collab-studio": {
        "cover_image": "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1400&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
        ],
        "video_url": "https://www.youtube.com/embed/aqz-KE-bpKQ?autoplay=0&rel=0",
    },
    "marseille-innovation-lab": {
        "cover_image": "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
        ],
        "video_url": "https://www.youtube.com/embed/J---aiyznGQ?autoplay=0&rel=0",
    },
}


class PublicCatalogService:
    def __init__(self, session: AsyncSession, redis: aioredis.Redis | None = None):
        self.session = session
        self._redis = redis

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
    def _slug(value: str | None) -> str:
        if not value:
            return ""
        return "-".join(value.lower().split())

    def _resolve_media(self, *candidates: str | None) -> dict[str, object]:
        for candidate in candidates:
            key = self._slug(candidate)
            if key and key in _MEDIA_PRESETS:
                return _MEDIA_PRESETS[key]

        return {
            "cover_image": None,
            "gallery": [],
            "video_url": None,
        }

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
    def _estimate_hourly_price(capacity: int) -> float:
        if capacity <= 10:
            return 20.0
        if capacity <= 25:
            return 35.0
        if capacity <= 50:
            return 55.0
        return 75.0

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
                    "price": float(
                        area_dict.get("price", fallback_price) or fallback_price
                    ),
                    "includes": includes,
                    "is_reservable": area_dict.get("is_reservable", True) is not False,
                    "geometry": geometry,
                }
            )

        return normalized

    async def build_rooms_catalog(self) -> list[dict[str, object]]:
        # ── Cache read ──────────────────────────────────────────────────────
        if self._redis is not None:
            cached = await get_cached(self._redis, _CATALOG_CACHE_KEY)
            if cached is not None:
                return cached  # type: ignore[return-value]

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
            media = self._resolve_media(floor.name, organization_name, floor_name)
            estimated_price = self._estimate_hourly_price(floor.capacity)

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
                    "price": estimated_price,
                    "address": floor.location,
                    "availability": availability,
                    "amenities": [],
                    "features": [],
                    "image": organization_name[:1].upper()
                    if organization_name
                    else "B",
                    "cover_image": media["cover_image"],
                    "gallery": media["gallery"],
                    "video_url": media["video_url"],
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
                            "price": estimated_price,
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
            if place.id.startswith("place-")
            and place.organization_id.startswith("org-")
        ]

        for place in managed_places:
            related_floors = [
                floor for floor in state.floors if floor.place_id == place.id
            ]
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
            media = self._resolve_media(place.name, organization_name, place.address)
            cover_image = (
                str(place.cover_image)
                if place.cover_image
                else media["cover_image"]
            )
            gallery = [str(item) for item in place.gallery] or media["gallery"]

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
                "cover_image": cover_image,
                "gallery": gallery,
                "video_url": media["video_url"],
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

        # ── Cache write ──────────────────────────────────────────────────────
        if self._redis is not None:
            await set_cached(self._redis, _CATALOG_CACHE_KEY, rooms, _CATALOG_CACHE_TTL)

        return rooms
