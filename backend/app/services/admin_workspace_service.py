from app.domain.enums import UserRole
from app.schemas.admin_workspace import (
    ContactRequestRecord,
    FloorRecord,
    FloorUpsertRequest,
    OrganizationRecord,
    OrganizationUpsertRequest,
    PlaceRecord,
    PlaceUpsertRequest,
    ReservationRecord,
    SettingsRecord,
    SettingsUpdateRequest,
    UserRecord,
    UserUpsertRequest,
    WorkspaceResponse,
)
from app.services.admin_workspace_dashboard_service import (
    AdminWorkspaceDashboardService,
)
from app.services.admin_workspace_organization_service import (
    AdminWorkspaceOrganizationService,
)
from app.services.admin_workspace_request_service import AdminWorkspaceRequestService
from app.services.admin_workspace_reservation_service import (
    AdminWorkspaceReservationService,
)
from app.services.admin_workspace_user_service import AdminWorkspaceUserService


class AdminWorkspaceService:
    @staticmethod
    def get_workspace(role: UserRole) -> WorkspaceResponse:
        return AdminWorkspaceDashboardService.get_workspace(role)

    @staticmethod
    def create_user(payload: UserUpsertRequest) -> UserRecord:
        return AdminWorkspaceUserService.create_user(payload)

    @staticmethod
    def update_user(user_id: str, payload: UserUpsertRequest) -> UserRecord:
        return AdminWorkspaceUserService.update_user(user_id, payload)

    @staticmethod
    def delete_user(user_id: str) -> None:
        AdminWorkspaceUserService.delete_user(user_id)

    @staticmethod
    def set_user_status(user_id: str, status_value: str) -> UserRecord:
        return AdminWorkspaceUserService.set_user_status(user_id, status_value)

    @staticmethod
    def create_organization(payload: OrganizationUpsertRequest) -> OrganizationRecord:
        return AdminWorkspaceOrganizationService.create_organization(payload)

    @staticmethod
    def update_organization(
        organization_id: str,
        payload: OrganizationUpsertRequest,
    ) -> OrganizationRecord:
        return AdminWorkspaceOrganizationService.update_organization(
            organization_id, payload
        )

    @staticmethod
    def delete_organization(organization_id: str) -> None:
        AdminWorkspaceOrganizationService.delete_organization(organization_id)

    @staticmethod
    def set_organization_status(
        organization_id: str,
        status_value: str,
    ) -> OrganizationRecord:
        return AdminWorkspaceOrganizationService.set_organization_status(
            organization_id,
            status_value,
        )

    @staticmethod
    def create_place(payload: PlaceUpsertRequest) -> PlaceRecord:
        return AdminWorkspaceOrganizationService.create_place(payload)

    @staticmethod
    def update_place(place_id: str, payload: PlaceUpsertRequest) -> PlaceRecord:
        return AdminWorkspaceOrganizationService.update_place(place_id, payload)

    @staticmethod
    def delete_place(place_id: str) -> None:
        AdminWorkspaceOrganizationService.delete_place(place_id)

    @staticmethod
    def create_floor(payload: FloorUpsertRequest) -> FloorRecord:
        return AdminWorkspaceOrganizationService.create_floor(payload)

    @staticmethod
    def update_floor(floor_id: str, payload: FloorUpsertRequest) -> FloorRecord:
        return AdminWorkspaceOrganizationService.update_floor(floor_id, payload)

    @staticmethod
    def delete_floor(floor_id: str) -> None:
        AdminWorkspaceOrganizationService.delete_floor(floor_id)

    @staticmethod
    def update_reservation_status(
        reservation_id: str,
        status_value: str,
    ) -> ReservationRecord:
        return AdminWorkspaceReservationService.update_reservation_status(
            reservation_id,
            status_value,
        )

    @staticmethod
    def update_contact_status(
        request_id: str,
        status_value: str,
    ) -> ContactRequestRecord:
        return AdminWorkspaceRequestService.update_contact_status(
            request_id, status_value
        )

    @staticmethod
    def delete_contact(request_id: str) -> None:
        AdminWorkspaceRequestService.delete_contact(request_id)

    @staticmethod
    def update_settings(payload: SettingsUpdateRequest) -> SettingsRecord:
        return AdminWorkspaceOrganizationService.update_settings(payload)
