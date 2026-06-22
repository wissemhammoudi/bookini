from __future__ import annotations

from app.domain.enums import UserRole
from app.schemas.admin_workspace import (
    ChartPoint,
    DashboardData,
    DashboardStatCard,
    RecentActivityItem,
    WorkspaceCollections,
    WorkspaceResponse,
)
from app.services.admin_workspace_seed import WorkspaceState
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspaceDashboardService:
    @classmethod
    def get_workspace(cls, role: UserRole) -> WorkspaceResponse:
        state = AdminWorkspaceStateStore.copy_state()
        collections = cls._collections_for_role(state, role)
        dashboard = cls._build_dashboard(collections, state.recent_activity)
        return WorkspaceResponse(
            role=role.value,
            dashboard=dashboard,
            collections=collections,
        )

    @staticmethod
    def _collections_for_role(
        state: WorkspaceState,
        role: UserRole,
    ) -> WorkspaceCollections:
        if role == UserRole.SUPER_ADMIN:
            return WorkspaceCollections(
                users=state.users,
                organizations=state.organizations,
                places=state.places,
                floors=state.floors,
                reservations=state.reservations,
                contact_requests=state.contact_requests,
                partnership_requests=state.partnership_requests,
                settings=state.settings,
            )

        admin_user = next((user for user in state.users if user.role == "ADMIN"), None)
        organization_id = admin_user.organization_id if admin_user else None
        places = [item for item in state.places if item.organization_id == organization_id]
        place_ids = {item.id for item in places}
        floors = [item for item in state.floors if item.place_id in place_ids]
        floor_ids = {item.id for item in floors}
        reservations = [item for item in state.reservations if item.floor_id in floor_ids]
        users = [
            item
            for item in state.users
            if item.organization_id == organization_id or item.role == "USER"
        ]
        organizations = [item for item in state.organizations if item.id == organization_id]
        return WorkspaceCollections(
            users=users,
            organizations=organizations,
            places=places,
            floors=floors,
            reservations=reservations,
            contact_requests=[],
            partnership_requests=[],
            settings=state.settings,
        )

    @staticmethod
    def _build_dashboard(
        collections: WorkspaceCollections,
        recent_activity: list[RecentActivityItem],
    ) -> DashboardData:
        stats = [
            DashboardStatCard(
                key="organizations",
                label="Total Organizations",
                value=len(collections.organizations),
                trend="+8% vs last month",
            ),
            DashboardStatCard(
                key="places",
                label="Total Places",
                value=len(collections.places),
                trend="+5 new this quarter",
            ),
            DashboardStatCard(
                key="floors",
                label="Total Floors",
                value=len(collections.floors),
                trend="Capacity stabilized",
            ),
            DashboardStatCard(
                key="reservations",
                label="Total Reservations",
                value=len(collections.reservations),
                trend="12 pending actions",
            ),
            DashboardStatCard(
                key="partnerships",
                label="Pending Partnership Requests",
                value=sum(item.status == "PENDING" for item in collections.partnership_requests),
                trend="Review queue updated",
            ),
            DashboardStatCard(
                key="contacts",
                label="Contact Requests",
                value=len(collections.contact_requests),
                trend="Support volume normal",
            ),
        ]

        reservations_by_month = [
            ChartPoint(label=label, value=value)
            for label, value in [
                ("Jan", 24),
                ("Feb", 31),
                ("Mar", 28),
                ("Apr", 44),
                ("May", 52),
                ("Jun", 58),
            ]
        ]

        place_counts: dict[str, int] = {}
        for reservation in collections.reservations:
            place_counts[reservation.place_name] = place_counts.get(reservation.place_name, 0) + 1

        most_reserved_places = [
            ChartPoint(label=name, value=count)
            for name, count in sorted(
                place_counts.items(),
                key=lambda entry: entry[1],
                reverse=True,
            )
        ]

        activity_counts: dict[str, int] = {}
        for place in collections.places:
            activity_counts[place.name] = sum(
                reservation.place_id == place.id for reservation in collections.reservations
            )

        organization_activity = [
            ChartPoint(label=name, value=count)
            for name, count in activity_counts.items()
        ]

        return DashboardData(
            stats=stats,
            reservations_by_month=reservations_by_month,
            most_reserved_places=most_reserved_places,
            organization_activity=organization_activity,
            recent_activity=recent_activity[:6],
        )
