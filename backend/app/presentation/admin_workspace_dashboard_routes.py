from fastapi import APIRouter

from app.core.responses import success_response
from app.presentation.admin_workspace_common import AdminAccessUser
from app.services.admin_workspace_dashboard_service import AdminWorkspaceDashboardService

router = APIRouter(tags=["admin"])


@router.get("/workspace")
async def get_workspace(
    current_user: AdminAccessUser,
) -> dict[str, object]:
    workspace = AdminWorkspaceDashboardService.get_workspace(current_user.role)
    return success_response(
        message="Admin workspace retrieved",
        data=workspace.model_dump(mode="json"),
    )
