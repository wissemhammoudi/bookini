from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.admin_workspace_common import RoleValue


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
    type: Literal["reservation", "organization", "contact", "user"]


class DashboardData(BaseModel):
    stats: list[DashboardStatCard]
    reservations_by_month: list[ChartPoint]
    most_reserved_places: list[ChartPoint]
    organization_activity: list[ChartPoint]
    recent_activity: list[RecentActivityItem]


class WorkspaceCollections(BaseModel):
    users: list["UserRecord"]
    organizations: list["OrganizationRecord"]
    places: list["PlaceRecord"]
    floors: list["FloorRecord"]
    reservations: list["ReservationRecord"]
    contact_requests: list["ContactRequestRecord"]
    settings: "SettingsRecord"


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    role: RoleValue
    dashboard: DashboardData
    collections: WorkspaceCollections


from app.schemas.admin_workspace_operations import (  # noqa: E402
    ContactRequestRecord,
    ReservationRecord,
)
from app.schemas.admin_workspace_organizations import (  # noqa: E402
    FloorRecord,
    OrganizationRecord,
    PlaceRecord,
)
from app.schemas.admin_workspace_settings import SettingsRecord  # noqa: E402
from app.schemas.admin_workspace_users import UserRecord  # noqa: E402

WorkspaceCollections.model_rebuild()
WorkspaceResponse.model_rebuild()
