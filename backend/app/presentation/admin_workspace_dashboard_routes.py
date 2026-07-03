import logging
from collections.abc import Iterable

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.domain.enums import FloorStatus
from app.infrastructure.session import get_db_session
from app.presentation.admin_workspace_common import AdminAccessUser
from app.repositories.floor_repository import FloorRepository
from app.services.admin_workspace_dashboard_service import (
    AdminWorkspaceDashboardService,
)
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore

router = APIRouter(tags=["admin"])
logger = logging.getLogger(__name__)


def _estimate_place_price(capacity: int) -> float:
    if capacity <= 10:
        return 20.0
    if capacity <= 25:
        return 35.0
    if capacity <= 50:
        return 55.0
    return 75.0


def _map_floor_status_to_workspace_status(status: FloorStatus) -> str:
    if status == FloorStatus.MAINTENANCE:
        return "SUSPENDED"
    return "ACTIVE"


def _normalize_building_id(building: str) -> str:
    normalized = "-".join(building.lower().split())
    return normalized or "default-building"


def _normalize_role_value(role: object) -> str:
    raw_role = getattr(role, "value", role)
    return str(raw_role).upper()


def _hydrate_places_from_floors(
    payload: dict[str, object],
    floors: Iterable[object],
) -> None:
    collections = payload.get("collections")
    if not isinstance(collections, dict):
        return

    mapped_places: list[dict[str, object]] = []
    mapped_floors: list[dict[str, object]] = []

    for floor in floors:
        status = _map_floor_status_to_workspace_status(floor.status)
        organization_id = _normalize_building_id(floor.building)
        place_id = str(floor.id)

        mapped_places.append(
            {
                "id": place_id,
                "organization_id": organization_id,
                "name": floor.name,
                "description": floor.description or f"Space in {floor.building}",
                "category": floor.building,
                "capacity": floor.capacity,
                "address": floor.location,
                "pricing": _estimate_place_price(floor.capacity),
                "availability": [],
                "cover_image": None,
                "gallery": [],
                "features": [],
                "status": status,
                "created_date": floor.created_at.isoformat(),
            }
        )

        mapped_floors.append(
            {
                "id": place_id,
                "place_id": place_id,
                "floor_name": floor.name,
                "floor_number": floor.floor_number,
                "floor_size_sqm": 100.0,
                "floor_shape": "RECTANGLE",
                "capacity": floor.capacity,
                "pricing": _estimate_place_price(floor.capacity),
                "description": floor.description or "",
                "blueprint_image": None,
                "reservation_areas": [],
                "status": status,
                "created_date": floor.created_at.isoformat(),
            }
        )

    if mapped_places:
        collections["places"] = mapped_places
        collections["floors"] = mapped_floors


def _build_workspace_fallback(current_user_role: object) -> dict[str, object]:
    state = AdminWorkspaceStateStore.copy_state()
    role_value = (
        current_user_role.value
        if hasattr(current_user_role, "value")
        else str(current_user_role)
    )

    users = [item.model_dump(mode="json") for item in state.users]
    organizations = [item.model_dump(mode="json") for item in state.organizations]
    places = [item.model_dump(mode="json") for item in state.places]
    floors = [item.model_dump(mode="json") for item in state.floors]
    reservations = [item.model_dump(mode="json") for item in state.reservations]
    contact_requests = [item.model_dump(mode="json") for item in state.contact_requests]
    settings = (
        state.settings.model_dump(mode="json")
        if state.settings
        else {
            "profile": {
                "full_name": "Admin",
                "email": "support@bookini.com",
                "phone": "",
                "title": "Admin",
            },
            "notifications": {
                "email_notifications": True,
                "sms_notifications": False,
                "weekly_report": True,
                "incident_alerts": True,
            },
            "platform": {
                "platform_name": "Bookini Admin",
                "support_email": "support@bookini.com",
                "timezone": "Africa/Tunis",
                "default_language": "en",
            },
            "security": {
                "session_timeout_minutes": 45,
                "require_mfa_for_admins": True,
                "password_rotation_days": 90,
            },
        }
    )

    dashboard = {
        "stats": [
            {
                "key": "organizations",
                "label": "Total Organizations",
                "value": len(organizations),
                "trend": "Fallback data",
            },
            {
                "key": "places",
                "label": "Total Places",
                "value": len(places),
                "trend": "Fallback data",
            },
            {
                "key": "floors",
                "label": "Total Floors",
                "value": len(floors),
                "trend": "Fallback data",
            },
            {
                "key": "reservations",
                "label": "Total Reservations",
                "value": len(reservations),
                "trend": "Fallback data",
            },
            {
                "key": "contacts",
                "label": "Contact Requests",
                "value": len(contact_requests),
                "trend": "Fallback data",
            },
        ],
        "reservations_by_month": [],
        "most_reserved_places": [],
        "organization_activity": [],
        "recent_activity": [
            item.model_dump(mode="json")
            for item in state.recent_activity[:6]
        ],
    }

    return {
        "role": role_value,
        "dashboard": dashboard,
        "collections": {
            "users": users,
            "organizations": organizations,
            "places": places,
            "floors": floors,
            "reservations": reservations,
            "contact_requests": contact_requests,
            "settings": settings,
        },
    }


@router.get("/workspace")
async def get_workspace(
    current_user: AdminAccessUser,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    role_value = _normalize_role_value(current_user.role)

    async def _load_relevant_floors() -> list[object]:
        floor_repository = FloorRepository(session)
        if role_value == "SUPER_ADMIN":
            return await floor_repository.list_floors(
                search=None,
                status=None,
                building=None,
                floor_number=None,
                include_deleted=False,
            )
        return await floor_repository.list_floors_by_admin(
            admin_id=str(current_user.id),
            include_deleted=False,
        )

    try:
        workspace = AdminWorkspaceDashboardService.get_workspace(current_user.role)
        payload = workspace.model_dump(mode="json")
        real_floors = await _load_relevant_floors()
        _hydrate_places_from_floors(payload, real_floors)
        message = "Admin workspace retrieved"
    except Exception as workspace_error:  # pragma: no cover - defensive fallback
        logger.exception("Workspace retrieval failed", exc_info=workspace_error)
        payload = _build_workspace_fallback(current_user.role)
        try:
            real_floors = await _load_relevant_floors()
            _hydrate_places_from_floors(payload, real_floors)
        except Exception as hydration_error:  # pragma: no cover
            logger.exception(
                "Workspace place hydration failed",
                exc_info=hydration_error,
            )
        message = "Admin workspace retrieved (fallback mode)"

    return success_response(
        message=message,
        data=payload,
    )


@router.get("/workspace/audit-logs")
async def get_workspace_audit_logs(
    current_user: AdminAccessUser,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    # 1. Fetch real DB audit logs (like REGISTER, LOGIN, LOGOUT)
    from app.repositories.audit_log_repository import AuditLogRepository

    db_repo = AuditLogRepository(session)
    db_logs = await db_repo.list_recent(limit=100)

    mapped_logs = []

    from app.repositories.user_repository import UserRepository

    user_repo = UserRepository(session)

    for log in db_logs:
        user_name = "System/Unknown"
        user_email = ""
        try:
            db_user = await user_repo.get_by_id(log.user_id)
            if db_user:
                user_name = db_user.full_name
                user_email = db_user.email
        except Exception:
            pass

        mapped_logs.append(
            {
                "id": f"db-{log.id}",
                "title": log.action.upper(),
                "description": (
                    f"{user_name} ({user_email or 'no email'}) "
                    f"performed {log.action} action."
                ),
                "timestamp": log.timestamp,
                "type": "user",
                "ip_address": log.ip_address,
            }
        )

    # 2. Fetch in-memory simulated recent activities
    state = AdminWorkspaceStateStore.get_state()
    for activity in state.recent_activity:
        mapped_logs.append(
            {
                "id": activity.id,
                "title": activity.title,
                "description": activity.description,
                "timestamp": activity.timestamp,
                "type": activity.type,
                "ip_address": "127.0.0.1",
            }
        )

    # Sort all logs by timestamp descending
    # Make sure we handle datetime format during serialization or parsing
    mapped_logs.sort(key=lambda x: x["timestamp"], reverse=True)

    # Format datetimes for JSON serialization
    serialized_logs = []
    for log in mapped_logs:
        ts = log["timestamp"]
        serialized_logs.append(
            {
                "id": log["id"],
                "title": log["title"],
                "description": log["description"],
                "timestamp": ts.isoformat() if hasattr(ts, "isoformat") else str(ts),
                "type": log["type"],
                "ip_address": log["ip_address"],
            }
        )

    return success_response(
        message="Workspace audit logs retrieved",
        data=serialized_logs,
    )
