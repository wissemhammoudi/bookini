from __future__ import annotations

from fastapi import HTTPException, status

from app.schemas.admin_workspace import FloorRecord, FloorUpsertRequest
from app.services.admin_workspace_helpers import (
    generate_prefixed_id,
    normalize_reservation_areas,
)
from app.services.admin_workspace_seed import utc_now
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspaceFloorService:
    @staticmethod
    def create_floor(payload: FloorUpsertRequest) -> FloorRecord:
        state = AdminWorkspaceStateStore.get_state()
        place_exists = any(place.id == payload.place_id for place in state.places)
        if not place_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected place does not exist",
            )

        payload_data = payload.model_dump()
        payload_data["reservation_areas"] = normalize_reservation_areas(
            payload.reservation_areas
        )

        floor = FloorRecord(
            id=generate_prefixed_id("floor"),
            created_date=utc_now(),
            **payload_data,
        )
        state.floors.insert(0, floor)
        AdminWorkspaceStateStore.record_activity(
            floor.floor_name,
            "Floor created.",
            "organization",
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

        payload_data = payload.model_dump()
        payload_data["reservation_areas"] = normalize_reservation_areas(
            payload.reservation_areas
        )

        for index, floor in enumerate(state.floors):
            if floor.id == floor_id:
                updated = floor.model_copy(update=payload_data)
                state.floors[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.floor_name,
                    "Floor updated.",
                    "organization",
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Floor not found",
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
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Floor not found",
            )
        AdminWorkspaceStateStore.record_activity(
            "Floor deleted",
            f"Floor {floor_id} was removed.",
            "organization",
        )
