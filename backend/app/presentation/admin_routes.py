from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationException
from app.core.responses import success_response
from app.dependencies.rbac import require_roles
from app.domain.enums import UserRole
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.presentation.admin_workspace_dashboard_routes import (
    router as admin_workspace_dashboard_router,
)
from app.presentation.admin_workspace_management_routes import (
    router as admin_workspace_management_router,
)
from app.presentation.admin_workspace_request_routes import (
    router as admin_workspace_request_router,
)
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.user_repository import UserRepository
from app.schemas.admin import AdminRoleUpdateRequest

router = APIRouter(prefix="/admin", tags=["admin"])
router.include_router(admin_workspace_dashboard_router)
router.include_router(admin_workspace_management_router)
router.include_router(admin_workspace_request_router)


@router.get("/dashboard")
async def admin_dashboard(
    current_user: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
) -> dict[str, object]:
    return success_response(
        message="Admin dashboard data retrieved",
        data={
            "role": current_user.role.value,
            "permissions_scope": "admin",
            "total_admin_users": 0,
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


@router.get("/reservations")
async def list_all_reservations(
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    from app.repositories.reservation_repository import ReservationRepository

    repository = ReservationRepository(session)
    reservations = await repository.list_all()

    data = [
        {
            "id": str(item.id),
            "user_id": str(item.user_id),
            "floor_id": str(item.floor_id),
            "start_time": item.start_time.isoformat(),
            "end_time": item.end_time.isoformat(),
            "status": item.status.value,
        }
        for item in reservations
    ]

    return success_response(
        message="Admin reservations retrieved",
        data=data,
    )


@router.get("/audit-logs")
async def audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    repository = AuditLogRepository(session)
    items = await repository.list_recent(limit=limit)
    data = [
        {
            "id": str(item.id),
            "user_id": str(item.user_id),
            "action": item.action,
            "ip_address": item.ip_address,
            "metadata": item.metadata_payload,
            "timestamp": item.timestamp.isoformat(),
        }
        for item in items
    ]
    return success_response(message="Audit logs retrieved", data=data)


@router.get("/admins")
async def list_admins(
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    repository = UserRepository(session)
    admins = await repository.list_admins()

    data = [
        {
            "id": str(item.id),
            "full_name": item.full_name,
            "email": item.email,
            "role": item.role.value,
            "is_active": item.is_active,
        }
        for item in admins
    ]
    return success_response(message="Admin users retrieved", data=data)


@router.patch("/admins/role")
async def update_admin_role(
    payload: AdminRoleUpdateRequest,
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    if payload.role not in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise ValidationException("Role must be ADMIN or SUPER_ADMIN")

    repository = UserRepository(session)
    user = await repository.get_by_email(payload.email)
    if not user:
        raise ValidationException("Target user not found")

    updated_user = await repository.update_role(user=user, role=payload.role)
    return success_response(
        message="Admin role updated",
        data={
            "id": str(updated_user.id),
            "email": updated_user.email,
            "role": updated_user.role.value,
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
            "total_admin_users": 0,
        },
    )
