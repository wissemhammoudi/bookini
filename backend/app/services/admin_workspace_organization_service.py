from __future__ import annotations

from fastapi import HTTPException, status

from app.schemas.admin_workspace import (
    FloorRecord,
    FloorUpsertRequest,
    OrganizationRecord,
    OrganizationUpsertRequest,
    PlaceRecord,
    PlaceUpsertRequest,
    SettingsRecord,
    SettingsUpdateRequest,
)
from app.services.admin_workspace_seed import utc_now
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspaceOrganizationService:
    @staticmethod
    def create_organization(payload: OrganizationUpsertRequest) -> OrganizationRecord:
        state = AdminWorkspaceStateStore.get_state()
        organization = OrganizationRecord(
            id=f"org-{utc_now().strftime('%H%M%S%f')[-8:]}",
            created_date=utc_now(),
            **payload.model_dump(),
        )
        state.organizations.insert(0, organization)
        AdminWorkspaceStateStore.record_activity(
            organization.name,
            "Organization profile created.",
            "organization",
        )
        return organization

    @staticmethod
    def update_organization(
        organization_id: str,
        payload: OrganizationUpsertRequest,
    ) -> OrganizationRecord:
        state = AdminWorkspaceStateStore.get_state()
        for index, organization in enumerate(state.organizations):
            if organization.id == organization_id:
                updated = organization.model_copy(update=payload.model_dump())
                state.organizations[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.name,
                    "Organization profile updated.",
                    "organization",
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    @staticmethod
    def delete_organization(organization_id: str) -> None:
        state = AdminWorkspaceStateStore.get_state()
        previous = len(state.organizations)
        state.organizations = [
            item for item in state.organizations if item.id != organization_id
        ]
        for user in state.users:
            if user.organization_ids and organization_id in user.organization_ids:
                user.organization_ids = [
                    org_id
                    for org_id in user.organization_ids
                    if org_id != organization_id
                ]
        state.users = [
            user
            for user in state.users
            if not user.organization_ids
            or len(user.organization_ids) > 0
            or user.role != "ADMIN"
        ]
        place_ids = {
            item.id for item in state.places if item.organization_id == organization_id
        }
        state.places = [
            item for item in state.places if item.organization_id != organization_id
        ]
        state.floors = [item for item in state.floors if item.place_id not in place_ids]
        state.reservations = [
            item for item in state.reservations if item.place_id not in place_ids
        ]
        if len(state.organizations) == previous:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
            )
        AdminWorkspaceStateStore.record_activity(
            "Organization deleted",
            f"Organization {organization_id} was removed.",
            "organization",
        )

    @staticmethod
    def set_organization_status(
        organization_id: str,
        status_value: str,
    ) -> OrganizationRecord:
        state = AdminWorkspaceStateStore.get_state()
        for index, organization in enumerate(state.organizations):
            if organization.id == organization_id:
                updated = organization.model_copy(update={"status": status_value})
                state.organizations[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.name,
                    f"Organization status set to {status_value}.",
                    "organization",
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    @staticmethod
    def create_place(payload: PlaceUpsertRequest) -> PlaceRecord:
        state = AdminWorkspaceStateStore.get_state()
        organization_exists = any(
            organization.id == payload.organization_id
            for organization in state.organizations
        )
        if not organization_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected organization does not exist",
            )

        place = PlaceRecord(
            id=f"place-{utc_now().strftime('%H%M%S%f')[-8:]}",
            created_date=utc_now(),
            **payload.model_dump(),
        )
        state.places.insert(0, place)
        AdminWorkspaceStateStore.record_activity(
            place.name, "Place created.", "organization"
        )
        return place

    @staticmethod
    def update_place(place_id: str, payload: PlaceUpsertRequest) -> PlaceRecord:
        state = AdminWorkspaceStateStore.get_state()
        organization_exists = any(
            organization.id == payload.organization_id
            for organization in state.organizations
        )
        if not organization_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected organization does not exist",
            )

        for index, place in enumerate(state.places):
            if place.id == place_id:
                updated = place.model_copy(update=payload.model_dump())
                state.places[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.name, "Place updated.", "organization"
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Place not found"
        )

    @staticmethod
    def delete_place(place_id: str) -> None:
        state = AdminWorkspaceStateStore.get_state()
        previous = len(state.places)
        state.places = [item for item in state.places if item.id != place_id]
        floor_ids = {item.id for item in state.floors if item.place_id == place_id}
        state.floors = [item for item in state.floors if item.place_id != place_id]
        state.reservations = [
            item for item in state.reservations if item.floor_id not in floor_ids
        ]
        if len(state.places) == previous:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Place not found"
            )
        AdminWorkspaceStateStore.record_activity(
            "Place deleted",
            f"Place {place_id} was removed.",
            "organization",
        )

    @staticmethod
    def create_floor(payload: FloorUpsertRequest) -> FloorRecord:
        state = AdminWorkspaceStateStore.get_state()
        place_exists = any(place.id == payload.place_id for place in state.places)
        if not place_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected place does not exist",
            )

        floor = FloorRecord(
            id=f"floor-{utc_now().strftime('%H%M%S%f')[-8:]}",
            created_date=utc_now(),
            **payload.model_dump(),
        )
        state.floors.insert(0, floor)
        AdminWorkspaceStateStore.record_activity(
            floor.floor_name, "Floor created.", "organization"
        )
        return floor

    @staticmethod
    def update_floor(floor_id: str, payload: FloorUpsertRequest) -> FloorRecord:
        state = AdminWorkspaceStateStore.get_state()
        place_exists = any(place.id == payload.place_id for place in state.places)
        if not place_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected place does not exist",
            )

        for index, floor in enumerate(state.floors):
            if floor.id == floor_id:
                updated = floor.model_copy(update=payload.model_dump())
                state.floors[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.floor_name, "Floor updated.", "organization"
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Floor not found"
        )

    @staticmethod
    def delete_floor(floor_id: str) -> None:
        state = AdminWorkspaceStateStore.get_state()
        previous = len(state.floors)
        state.floors = [item for item in state.floors if item.id != floor_id]
        state.reservations = [
            item for item in state.reservations if item.floor_id != floor_id
        ]
        if len(state.floors) == previous:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Floor not found"
            )
        AdminWorkspaceStateStore.record_activity(
            "Floor deleted",
            f"Floor {floor_id} was removed.",
            "organization",
        )

    @staticmethod
    def update_settings(payload: SettingsUpdateRequest) -> SettingsRecord:
        state = AdminWorkspaceStateStore.get_state()
        state.settings = SettingsRecord(**payload.model_dump())
        AdminWorkspaceStateStore.record_activity(
            state.settings.profile.full_name,
            "Settings were updated.",
            "user",
        )
        return state.settings
