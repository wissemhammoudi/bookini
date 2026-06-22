from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl


RoleValue = Literal["SUPER_ADMIN", "ADMIN", "USER"]
StatusValue = Literal["ACTIVE", "SUSPENDED"]
ReservationStatusValue = Literal[
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
]
RequestStatusValue = Literal["PENDING", "APPROVED", "REJECTED", "PROCESSED"]


class DashboardStatCard(BaseModel):
    key: str
    label: str
    value: int
    trend: str


class ChartPoint(BaseModel):
    label: str
    value: int


class RecentActivityItem(BaseModel):
    id: str
    title: str
    description: str
    timestamp: datetime
    type: Literal["reservation", "organization", "partnership", "contact", "user"]


class DashboardData(BaseModel):
    stats: list[DashboardStatCard]
    reservations_by_month: list[ChartPoint]
    most_reserved_places: list[ChartPoint]
    organization_activity: list[ChartPoint]
    recent_activity: list[RecentActivityItem]


class UserRecord(BaseModel):
    id: str
    profile_image: HttpUrl | None = None
    full_name: str
    email: EmailStr
    phone: str
    role: RoleValue
    status: StatusValue
    created_date: datetime
    organization_id: str | None = None


class UserUpsertRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=30)
    role: RoleValue
    status: StatusValue = "ACTIVE"
    organization_id: str | None = None


class OrganizationRecord(BaseModel):
    id: str
    logo: HttpUrl | None = None
    cover_image: HttpUrl | None = None
    name: str
    description: str
    address: str
    contact_email: EmailStr
    contact_phone: str
    website: HttpUrl | None = None
    social_links: list[HttpUrl] = Field(default_factory=list)
    status: StatusValue
    created_date: datetime


class OrganizationUpsertRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=10, max_length=600)
    address: str = Field(min_length=5, max_length=255)
    contact_email: EmailStr
    contact_phone: str = Field(min_length=6, max_length=30)
    website: HttpUrl | None = None
    logo: HttpUrl | None = None
    cover_image: HttpUrl | None = None
    social_links: list[HttpUrl] = Field(default_factory=list)
    status: StatusValue = "ACTIVE"


class PlaceRecord(BaseModel):
    id: str
    organization_id: str
    name: str
    description: str
    category: str
    capacity: int
    address: str
    pricing: float
    availability: str
    cover_image: HttpUrl | None = None
    gallery: list[HttpUrl] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    status: StatusValue
    created_date: datetime


class PlaceUpsertRequest(BaseModel):
    organization_id: str
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=10, max_length=600)
    category: str = Field(min_length=2, max_length=80)
    capacity: int = Field(ge=1, le=5000)
    address: str = Field(min_length=5, max_length=255)
    pricing: float = Field(ge=0)
    availability: str = Field(min_length=2, max_length=120)
    cover_image: HttpUrl | None = None
    gallery: list[HttpUrl] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    status: StatusValue = "ACTIVE"


class FloorRecord(BaseModel):
    id: str
    place_id: str
    floor_name: str
    floor_number: int
    capacity: int
    description: str
    blueprint_image: HttpUrl | None = None
    reservation_areas: list[str] = Field(default_factory=list)
    status: StatusValue
    created_date: datetime


class FloorUpsertRequest(BaseModel):
    place_id: str
    floor_name: str = Field(min_length=2, max_length=120)
    floor_number: int = Field(ge=0, le=200)
    capacity: int = Field(ge=1, le=5000)
    description: str = Field(min_length=5, max_length=400)
    blueprint_image: HttpUrl | None = None
    reservation_areas: list[str] = Field(default_factory=list)
    status: StatusValue = "ACTIVE"


class ReservationRecord(BaseModel):
    id: str
    user_id: str
    user_name: str
    place_id: str
    place_name: str
    floor_id: str
    floor_name: str
    date: str
    time: str
    status: ReservationStatusValue
    created_date: datetime


class ReservationStatusUpdateRequest(BaseModel):
    status: ReservationStatusValue


class ContactRequestRecord(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: str
    subject: str
    message: str
    date: datetime
    status: RequestStatusValue


class ContactRequestStatusUpdateRequest(BaseModel):
    status: Literal["PENDING", "PROCESSED"]


class PartnershipRequestRecord(BaseModel):
    id: str
    company_name: str
    contact_person: str
    email: EmailStr
    phone: str
    business_description: str
    requested_date: datetime
    status: Literal["PENDING", "APPROVED", "REJECTED"]
    generated_credentials: dict[str, str] | None = None


class PartnershipRequestStatusUpdateRequest(BaseModel):
    status: Literal["APPROVED", "REJECTED"]


class NotificationSettings(BaseModel):
    email_notifications: bool
    sms_notifications: bool
    weekly_report: bool
    incident_alerts: bool


class SecuritySettings(BaseModel):
    session_timeout_minutes: int
    require_mfa_for_admins: bool
    password_rotation_days: int


class PlatformSettings(BaseModel):
    platform_name: str
    support_email: EmailStr
    timezone: str
    default_language: str


class ProfileSettings(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    title: str


class SettingsRecord(BaseModel):
    profile: ProfileSettings
    notifications: NotificationSettings
    platform: PlatformSettings
    security: SecuritySettings


class SettingsUpdateRequest(BaseModel):
    profile: ProfileSettings
    notifications: NotificationSettings
    platform: PlatformSettings
    security: SecuritySettings


class WorkspaceCollections(BaseModel):
    users: list[UserRecord]
    organizations: list[OrganizationRecord]
    places: list[PlaceRecord]
    floors: list[FloorRecord]
    reservations: list[ReservationRecord]
    contact_requests: list[ContactRequestRecord]
    partnership_requests: list[PartnershipRequestRecord]
    settings: SettingsRecord


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    role: RoleValue
    dashboard: DashboardData
    collections: WorkspaceCollections
