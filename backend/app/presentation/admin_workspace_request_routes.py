from fastapi import APIRouter, Response

from app.core.responses import success_response
from app.presentation.admin_workspace_common import SuperAdminAccessUser
from app.schemas.admin_workspace import (
    ContactRequestStatusUpdateRequest,
)
from app.services.admin_workspace_request_service import AdminWorkspaceRequestService

router = APIRouter(tags=["admin"])


@router.patch("/workspace/contact-requests/{request_id}")
async def update_contact_status(
    request_id: str,
    payload: ContactRequestStatusUpdateRequest,
    _: SuperAdminAccessUser,
) -> dict[str, object]:
    contact = AdminWorkspaceRequestService.update_contact_status(
        request_id, payload.status
    )
    return success_response(
        message="Contact request updated", data=contact.model_dump(mode="json")
    )


@router.delete("/workspace/contact-requests/{request_id}", status_code=204)
async def delete_contact_request(
    request_id: str,
    _: SuperAdminAccessUser,
) -> Response:
    AdminWorkspaceRequestService.delete_contact(request_id)
    return Response(status_code=204)
