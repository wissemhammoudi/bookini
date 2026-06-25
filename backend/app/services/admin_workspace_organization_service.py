from __future__ import annotations

from app.schemas.admin_workspace import (
    FloorRecord,
    FloorUpsertRequest,
    OrganizationRecord,
    OrganizationUpsertRequest,
    PlaceRecord,
    PlaceUpsertRequest,
    ReservationAreaRecord,
    SettingsRecord,
    SettingsUpdateRequest,
)
from app.services.admin_workspace_floor_service import AdminWorkspaceFloorService
from app.services.admin_workspace_helpers import normalize_reservation_areas
from app.services.admin_workspace_organization_lifecycle_service import (
    AdminWorkspaceOrganizationLifecycleService,
)
from app.services.admin_workspace_place_service import AdminWorkspacePlaceService
from app.services.admin_workspace_settings_service import AdminWorkspaceSettingsService


class AdminWorkspaceOrganizationService:
    """Compatibility facade for existing imports.

    This class keeps the previous public API while delegating implementation
    to focused lifecycle services.
    """

    @staticmethod
    def _normalize_reservation_areas(
        reservation_areas: list[str | ReservationAreaRecord],
    ) -> list[ReservationAreaRecord]:
        return normalize_reservation_areas(reservation_areas)

    @staticmethod
    def create_organization(payload: OrganizationUpsertRequest) -> OrganizationRecord:
        return AdminWorkspaceOrganizationLifecycleService.create_organization(payload)

    @staticmethod
    def update_organization(
        organization_id: str,
        payload: OrganizationUpsertRequest,
    ) -> OrganizationRecord:
        return AdminWorkspaceOrganizationLifecycleService.update_organization(
            organization_id,
            payload,
        )

    @staticmethod
    def delete_organization(organization_id: str) -> None:
        AdminWorkspaceOrganizationLifecycleService.delete_organization(organization_id)

    @staticmethod
    def set_organization_status(
        organization_id: str,
        status_value: str,
    ) -> OrganizationRecord:
        return AdminWorkspaceOrganizationLifecycleService.set_organization_status(
            organization_id,
            status_value,
        )

    @staticmethod
    def create_place(payload: PlaceUpsertRequest) -> PlaceRecord:
        return AdminWorkspacePlaceService.create_place(payload)

    @staticmethod
    def update_place(place_id: str, payload: PlaceUpsertRequest) -> PlaceRecord:
        return AdminWorkspacePlaceService.update_place(place_id, payload)

    @staticmethod
    def delete_place(place_id: str) -> None:
        AdminWorkspacePlaceService.delete_place(place_id)

    @staticmethod
    def create_floor(payload: FloorUpsertRequest) -> FloorRecord:
        return AdminWorkspaceFloorService.create_floor(payload)

    @staticmethod
    def update_floor(floor_id: str, payload: FloorUpsertRequest) -> FloorRecord:
        return AdminWorkspaceFloorService.update_floor(floor_id, payload)

    @staticmethod
    def delete_floor(floor_id: str) -> None:
        AdminWorkspaceFloorService.delete_floor(floor_id)

    @staticmethod
    def update_settings(payload: SettingsUpdateRequest) -> SettingsRecord:
        return AdminWorkspaceSettingsService.update_settings(payload)
