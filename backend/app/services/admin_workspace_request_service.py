from __future__ import annotations

from fastapi import HTTPException, status

from app.schemas.admin_workspace import ContactRequestRecord
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspaceRequestService:
    @staticmethod
    def update_contact_status(
        request_id: str, status_value: str
    ) -> ContactRequestRecord:
        state = AdminWorkspaceStateStore.get_state()
        for index, contact in enumerate(state.contact_requests):
            if contact.id == request_id:
                updated = contact.model_copy(update={"status": status_value})
                state.contact_requests[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.full_name,
                    f"Contact request marked {status_value.lower()}.",
                    "contact",
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contact request not found"
        )

    @staticmethod
    def delete_contact(request_id: str) -> None:
        state = AdminWorkspaceStateStore.get_state()
        previous = len(state.contact_requests)
        state.contact_requests = [
            item for item in state.contact_requests if item.id != request_id
        ]
        if len(state.contact_requests) == previous:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact request not found",
            )
        AdminWorkspaceStateStore.record_activity(
            "Contact request deleted",
            f"Request {request_id} was removed.",
            "contact",
        )
