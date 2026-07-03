from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime

from app.schemas.admin_workspace import (
    AvailabilitySlot,
    ContactRequestRecord,
    FloorRecord,
    OrganizationRecord,
    PlaceRecord,
    RecentActivityItem,
    ReservationAreaRecord,
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

    now = utc_now()

    # Preload mock users
    user1 = UserRecord(
        id="user-1",
        full_name="Alice Johnson",
        email="alice@bookiwa7dek.com",
        phone="+216 22 222 222",
        role="USER",
        status="ACTIVE",
        created_date=now,
        organization_ids=["org-1"],
    )
    user2 = UserRecord(
        id="user-2",
        full_name="Bob Smith",
        email="bob@bookiwa7dek.com",
        phone="+216 33 333 333",
        role="USER",
        status="ACTIVE",
        created_date=now,
        organization_ids=["org-1"],
    )
    user_admin = UserRecord(
        id="admin-1",
        full_name="Workspace Admin",
        email="admin@bookiwa7dek.com",
        phone="+216 44 444 444",
        role="ADMIN",
        status="ACTIVE",
        created_date=now,
        organization_ids=["org-1"],
    )

    # Preload mock organizations
    org = OrganizationRecord(
        id="org-1",
        name="SmartSpace Tech",
        description="Pioneers in high-tech coworking structures.",
        address="Tunis, Tunisia",
        contact_email="contact@smartspace.tn",
        contact_phone="+216 71 888 888",
        status="ACTIVE",
        created_date=now,
    )

    # Preload mock places
    place = PlaceRecord(
        id="place-1",
        organization_id="org-1",
        name="Marseille Innovation Lab",
        description="Cozy hub for developers, equipped with fiber internet, comfortable workspaces, and complimentary coffee.",  # noqa: E501
        category="Co-working space",
        capacity=80,
        address="Marseille, France",
        pricing=15.0,
        availability=[
            AvailabilitySlot(day="MONDAY", start_time="08:00", end_time="19:00"),
            AvailabilitySlot(day="TUESDAY", start_time="08:00", end_time="19:00"),
            AvailabilitySlot(day="WEDNESDAY", start_time="08:00", end_time="19:00"),
            AvailabilitySlot(day="THURSDAY", start_time="08:00", end_time="19:00"),
            AvailabilitySlot(day="FRIDAY", start_time="08:00", end_time="19:00"),
        ],
        cover_image="https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80",
        gallery=[
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
        ],
        features=["WiFi 6", "Coffee Machine", "Whiteboard", "Dual Monitors"],
        status="ACTIVE",
        created_date=now,
    )

    # Preload mock floors
    floor = FloorRecord(
        id="floor-1",
        place_id="place-1",
        floor_name="Creative Floor",
        floor_number=1,
        floor_size_sqm=120.0,
        floor_shape="RECTANGLE",
        capacity=40,
        pricing=15.0,
        description="A vibrant floor tailored for design sprints and startup activities.",  # noqa: E501
        blueprint_image=None,
        reservation_areas=[
            ReservationAreaRecord(
                name="Design Studio",
                price=10.0,
                includes=["Projector", "Large whiteboard", "Ergonomic chairs"],
                is_reservable=True,
            ),
            ReservationAreaRecord(
                name="Coding Hub",
                price=8.0,
                includes=[
                    "Dual 27-inch monitors",
                    "High-speed Ethernet",
                    "Comfortable desk",
                ],
                is_reservable=True,
            ),
        ],
        status="ACTIVE",
        created_date=now,
    )

    # Preload mock reservations
    res = ReservationRecord(
        id="res-1",
        user_id="user-1",
        user_name="Alice Johnson",
        place_id="place-1",
        place_name="Marseille Innovation Lab",
        floor_id="floor-1",
        floor_name="Creative Floor",
        date="2026-06-25",
        time="09:00 - 12:00",
        status="APPROVED",
        created_date=now,
    )

    # Preload contact requests
    req = ContactRequestRecord(
        id="req-1",
        full_name="Sami Ben Ali",
        email="sami@gmail.com",
        phone="+216 55 555 555",
        subject="Corporate Partnership",
        message="We would like to book the whole floor for our design and engineering team next month.",  # noqa: E501
        date=now,
        status="PENDING",
    )

    # Preload recent activity
    act1 = RecentActivityItem(
        id="act-1",
        title="Reservation Request",
        description="Alice Johnson submitted a request for Marseille Innovation Lab.",
        timestamp=now,
        type="reservation",
    )
    act2 = RecentActivityItem(
        id="act-2",
        title="New User Registered",
        description="Bob Smith created an account on the platform.",
        timestamp=now,
        type="user",
    )

    return WorkspaceState(
        users=[user_admin, user1, user2],
        organizations=[org],
        places=[place],
        floors=[floor],
        reservations=[res],
        contact_requests=[req],
        settings=settings,
        recent_activity=[act1, act2],
    )
