from fastapi import APIRouter, Depends

from app.core.responses import success_response
from app.dependencies.rbac import require_roles
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
async def admin_dashboard(
    current_user: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
) -> dict[str, object]:
    return success_response(
        message="Admin dashboard data retrieved",
        data={
            "role": current_user.role.value,
            "permissions_scope": "admin",
        },
    )


@router.post("/floors/{floor_id}/archive")
async def archive_floor(
    floor_id: str,
    current_user: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
) -> dict[str, object]:
    return success_response(
        message="Sensitive floor operation authorized",
        data={
            "floor_id": floor_id,
            "performed_by": str(current_user.id),
        },
    )


@router.get("/super-admin/settings")
async def super_admin_settings(
    current_user: User = Depends(require_roles(["SUPER_ADMIN"])),
) -> dict[str, object]:
    return success_response(
        message="Super admin settings retrieved",
        data={
            "role": current_user.role.value,
            "permissions_scope": "super_admin",
        },
    )
