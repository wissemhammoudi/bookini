from __future__ import annotations

from fastapi import HTTPException, status

from app.schemas.admin_workspace import PlaceRecord, PlaceUpsertRequest
from app.services.admin_workspace_helpers import generate_prefixed_id
from app.services.admin_workspace_seed import utc_now
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspacePlaceService:
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
            id=generate_prefixed_id("place"),
            created_date=utc_now(),
            **payload.model_dump(),
        )
        state.places.insert(0, place)
        AdminWorkspaceStateStore.record_activity(
            place.name,
            "Place created.",
            "organization",
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
                    updated.name,
                    "Place updated.",
                    "organization",
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found",
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
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Place not found",
            )
        AdminWorkspaceStateStore.record_activity(
            "Place deleted",
            f"Place {place_id} was removed.",
            "organization",
        )
