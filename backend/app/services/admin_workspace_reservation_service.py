from __future__ import annotations

from fastapi import HTTPException, status

from app.schemas.admin_workspace import ReservationRecord
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspaceReservationService:
    @staticmethod
    def update_reservation_status(
        reservation_id: str,
        status_value: str,
    ) -> ReservationRecord:
        state = AdminWorkspaceStateStore.get_state()
        for index, reservation in enumerate(state.reservations):
            if reservation.id == reservation_id:
                updated = reservation.model_copy(update={"status": status_value})
                state.reservations[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.place_name,
                    f"Reservation set to {status_value}.",
                    "reservation",
                )
                return updated
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
