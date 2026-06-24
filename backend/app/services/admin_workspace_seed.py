from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta

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
    now = utc_now()
    organizations = [
        OrganizationRecord(
            id="org-atlas",
            logo="https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=200&q=80",
            cover_image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
            name="Atlas Business Hub",
            description="Premium coworking spaces for teams and enterprise events.",
            address="12 Riverside Avenue, Tunis",
            contact_email="hello@atlas-hub.com",
            contact_phone="+216 20 100 200",
            website="https://atlas-hub.example.com",
            social_links=[
                "https://linkedin.com/company/atlas-hub",
                "https://instagram.com/atlas-hub",
            ],
            status="ACTIVE",
            created_date=now - timedelta(days=300),
        ),
        OrganizationRecord(
            id="org-marina",
            logo="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
            cover_image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80",
            name="Marina Event Spaces",
            description="Flexible venues for workshops, meetups, and private bookings.",
            address="44 Lac View, Tunis",
            contact_email="contact@marina-event.com",
            contact_phone="+216 20 300 400",
            website="https://marina-event.example.com",
            social_links=["https://facebook.com/marina-event"],
            status="ACTIVE",
            created_date=now - timedelta(days=210),
        ),
        OrganizationRecord(
            id="org-oasis",
            logo="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=200&q=80",
            cover_image="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
            name="Oasis Studios",
            description=(
                "Creative studios designed for production teams and content creators."
            ),
            address="9 Palm District, Sousse",
            contact_email="team@oasis-studios.com",
            contact_phone="+216 25 500 600",
            website="https://oasis-studios.example.com",
            social_links=["https://x.com/oasis-studios"],
            status="SUSPENDED",
            created_date=now - timedelta(days=120),
        ),
    ]
    users = [
        UserRecord(
            id="user-super-1",
            profile_image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            full_name="Lina Trabelsi",
            email="superadmin@bookini.com",
            phone="+216 22 000 111",
            role="SUPER_ADMIN",
            status="ACTIVE",
            created_date=now - timedelta(days=365),
        ),
        UserRecord(
            id="user-admin-1",
            profile_image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
            full_name="Karim Ben Ali",
            email="admin@atlas-hub.com",
            phone="+216 25 111 222",
            role="ADMIN",
            status="ACTIVE",
            organization_ids=["org-atlas"],
            created_date=now - timedelta(days=250),
        ),
        UserRecord(
            id="user-admin-2",
            profile_image="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
            full_name="Salma Jaziri",
            email="admin@marina-event.com",
            phone="+216 26 333 444",
            role="ADMIN",
            status="ACTIVE",
            organization_ids=["org-marina"],
            created_date=now - timedelta(days=190),
        ),
        UserRecord(
            id="user-regular-1",
            profile_image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
            full_name="Mohamed Gharbi",
            email="mohamed@example.com",
            phone="+216 29 123 456",
            role="USER",
            status="ACTIVE",
            created_date=now - timedelta(days=90),
        ),
        UserRecord(
            id="user-regular-2",
            profile_image="https://images.unsplash.com/photo-1542204625-de293a2f8ff5?auto=format&fit=crop&w=200&q=80",
            full_name="Aya Kefi",
            email="aya@example.com",
            phone="+216 29 654 321",
            role="USER",
            status="SUSPENDED",
            created_date=now - timedelta(days=30),
        ),
    ]
    places = [
        PlaceRecord(
            id="place-atlas-sky",
            organization_id="org-atlas",
            name="Skyline Workspace",
            description="A premium business lounge with modular meeting zones.",
            category="Coworking",
            capacity=120,
            address="12 Riverside Avenue, Tunis",
            pricing=180.0,
            availability="Mon-Sat, 08:00-22:00",
            cover_image="https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
            gallery=[
                "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=800&q=80",
            ],
            features=[
                "Floor Management",
                "2D Floor Plan Generation",
                "Reservation Zones",
                "Availability Calendar",
            ],
            status="ACTIVE",
            created_date=now - timedelta(days=280),
        ),
        PlaceRecord(
            id="place-marina-lab",
            organization_id="org-marina",
            name="Marina Lab",
            description="An event-ready venue tailored for tech meetups and panels.",
            category="Event Hall",
            capacity=200,
            address="44 Lac View, Tunis",
            pricing=320.0,
            availability="Daily, 09:00-23:00",
            cover_image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
            gallery=[
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
            ],
            features=[
                "Interactive Floor Layout",
                "Reservation Zones",
                "Availability Calendar",
            ],
            status="ACTIVE",
            created_date=now - timedelta(days=205),
        ),
        PlaceRecord(
            id="place-oasis-creator",
            organization_id="org-oasis",
            name="Creator Loft",
            description="Production suites for photo shoots and creator workshops.",
            category="Studio",
            capacity=45,
            address="9 Palm District, Sousse",
            pricing=95.0,
            availability="Sun-Fri, 10:00-20:00",
            cover_image="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
            gallery=[
                "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80"
            ],
            features=["Gallery", "2D Floor Plan Generation"],
            status="SUSPENDED",
            created_date=now - timedelta(days=110),
        ),
    ]
    floors = [
        FloorRecord(
            id="floor-sky-1",
            place_id="place-atlas-sky",
            floor_name="Skyline Ground",
            floor_number=0,
            capacity=50,
            description="Reception and collaborative lounge.",
            blueprint_image='[{"name": "Reception Desk", "x": 50, "y": 50, "w": 120, "h": 60, "type": "desk", "rotation": 0, "isReservable": true}, {"name": "Projector Screen A", "x": 200, "y": 30, "w": 100, "h": 20, "type": "projector", "rotation": 0, "isReservable": false}, {"name": "Team Table 1", "x": 100, "y": 200, "w": 140, "h": 80, "type": "table", "rotation": 90, "isReservable": true}, {"name": "Lounge Plant 1", "x": 350, "y": 80, "w": 40, "h": 40, "type": "plant", "rotation": 0, "isReservable": false}, {"name": "Lounge Chair 1", "x": 350, "y": 140, "w": 40, "h": 40, "type": "chair", "rotation": 180, "isReservable": false}, {"name": "Partition Wall", "x": 20, "y": 320, "w": 200, "h": 20, "type": "wall", "rotation": 0, "isReservable": false}]',  # noqa: E501
            reservation_areas=["Reception Desk", "Team Table 1"],
            status="ACTIVE",
            created_date=now - timedelta(days=275),
        ),
        FloorRecord(
            id="floor-sky-2",
            place_id="place-atlas-sky",
            floor_name="Skyline Upper",
            floor_number=1,
            capacity=70,
            description="Boardrooms and quiet focus sections.",
            blueprint_image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80",
            reservation_areas=["Boardroom A", "Boardroom B", "Private Cabins"],
            status="ACTIVE",
            created_date=now - timedelta(days=274),
        ),
        FloorRecord(
            id="floor-marina-1",
            place_id="place-marina-lab",
            floor_name="Marina Main Hall",
            floor_number=1,
            capacity=200,
            description="Flexible hall with configurable stage and seating.",
            blueprint_image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
            reservation_areas=["Stage", "VIP Zone", "Open Seating"],
            status="ACTIVE",
            created_date=now - timedelta(days=200),
        ),
    ]
    reservations = [
        ReservationRecord(
            id="res-1001",
            user_id="user-regular-1",
            user_name="Mohamed Gharbi",
            place_id="place-atlas-sky",
            place_name="Skyline Workspace",
            floor_id="floor-sky-1",
            floor_name="Skyline Ground",
            date=(now + timedelta(days=2)).date().isoformat(),
            time="09:00 - 12:00",
            status="PENDING",
            created_date=now - timedelta(hours=4),
        ),
        ReservationRecord(
            id="res-1002",
            user_id="user-regular-2",
            user_name="Aya Kefi",
            place_id="place-marina-lab",
            place_name="Marina Lab",
            floor_id="floor-marina-1",
            floor_name="Marina Main Hall",
            date=(now + timedelta(days=5)).date().isoformat(),
            time="14:00 - 18:00",
            status="APPROVED",
            created_date=now - timedelta(days=1, hours=2),
        ),
        ReservationRecord(
            id="res-1003",
            user_id="user-regular-1",
            user_name="Mohamed Gharbi",
            place_id="place-atlas-sky",
            place_name="Skyline Workspace",
            floor_id="floor-sky-2",
            floor_name="Skyline Upper",
            date=(now + timedelta(days=8)).date().isoformat(),
            time="10:00 - 11:30",
            status="REJECTED",
            created_date=now - timedelta(days=2, hours=6),
        ),
    ]
    contact_requests = [
        ContactRequestRecord(
            id="contact-1",
            full_name="Rim Toumi",
            email="rim@example.com",
            phone="+216 21 999 000",
            subject="Need enterprise pricing",
            message="Can your team support annual contracts for multiple branches?",
            date=now - timedelta(hours=7),
            status="PENDING",
        ),
        ContactRequestRecord(
            id="contact-2",
            full_name="Firas Louati",
            email="firas@example.com",
            phone="+216 24 555 777",
            subject="Issue with reservation confirmation",
            message="The confirmation email did not arrive after a successful payment.",
            date=now - timedelta(days=1, hours=3),
            status="PROCESSED",
        ),
    ]

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
    recent_activity = [
        RecentActivityItem(
            id="activity-1",
            title="Reservation pending approval",
            description="Mohamed requested Skyline Ground for a team session.",
            timestamp=now - timedelta(hours=4),
            type="reservation",
        ),
        RecentActivityItem(
            id="activity-2",
            title="New organization onboarded",
            description="Marina Event Spaces completed profile setup.",
            timestamp=now - timedelta(days=1),
            type="organization",
        ),
    ]
    return WorkspaceState(
        users=users,
        organizations=organizations,
        places=places,
        floors=floors,
        reservations=reservations,
        contact_requests=contact_requests,
        settings=settings,
        recent_activity=recent_activity,
    )
