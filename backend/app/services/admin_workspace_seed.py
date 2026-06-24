from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime

from app.schemas.admin_workspace import (
    ContactRequestRecord,
    FloorRecord,
    OrganizationRecord,
    PlaceRecord,
    RecentActivityItem,
    ReservationRecord,
    SettingsRecord,
    UserRecord,
)


def utc_now() -> datetime:
    return datetime.now(UTC)


@dataclass
class WorkspaceState:
    users: list[UserRecord] = field(default_factory=list)
    organizations: list[OrganizationRecord] = field(default_factory=list)
    places: list[PlaceRecord] = field(default_factory=list)
    floors: list[FloorRecord] = field(default_factory=list)
    reservations: list[ReservationRecord] = field(default_factory=list)
    contact_requests: list[ContactRequestRecord] = field(default_factory=list)
    settings: SettingsRecord | None = None
    recent_activity: list[RecentActivityItem] = field(default_factory=list)


def build_workspace_state() -> WorkspaceState:
    # Start from a clean state: no preloaded demo entities.
    settings = SettingsRecord(
        profile={
            "full_name": "Lina Trabelsi",
            "email": "superadmin@bookini.com",
            "phone": "+216 22 000 111",
            "title": "Platform Director",
        },
        notifications={
            "email_notifications": True,
            "sms_notifications": False,
            "weekly_report": True,
            "incident_alerts": True,
        },
        platform={
            "platform_name": "Bookini Admin",
            "support_email": "support@bookini.com",
            "timezone": "Africa/Tunis",
            "default_language": "en",
        },
        security={
            "session_timeout_minutes": 45,
            "require_mfa_for_admins": True,
            "password_rotation_days": 90,
        },
    )

    return WorkspaceState(
        users=[],
        organizations=[],
        places=[],
        floors=[],
        reservations=[],
        contact_requests=[],
        settings=settings,
        recent_activity=[],
    )
