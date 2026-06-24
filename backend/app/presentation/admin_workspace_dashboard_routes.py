from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.infrastructure.session import get_db_session
from app.presentation.admin_workspace_common import AdminAccessUser
from app.services.admin_workspace_dashboard_service import (
    AdminWorkspaceDashboardService,
)
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore

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


@router.get("/workspace/audit-logs")
async def get_workspace_audit_logs(
    current_user: AdminAccessUser,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    # 1. Fetch real DB audit logs (like REGISTER, LOGIN, LOGOUT)
    from app.repositories.audit_log_repository import AuditLogRepository

    db_repo = AuditLogRepository(session)
    db_logs = await db_repo.list_recent(limit=100)

    mapped_logs = []

    from app.repositories.user_repository import UserRepository

    user_repo = UserRepository(session)

    for log in db_logs:
        user_name = "System/Unknown"
        user_email = ""
        try:
            db_user = await user_repo.get_by_id(log.user_id)
            if db_user:
                user_name = db_user.full_name
                user_email = db_user.email
        except Exception:
            pass

        mapped_logs.append(
            {
                "id": f"db-{log.id}",
                "title": log.action.upper(),
                "description": (
                    f"{user_name} ({user_email or 'no email'}) "
                    f"performed {log.action} action."
                ),
                "timestamp": log.timestamp,
                "type": "user",
                "ip_address": log.ip_address,
            }
        )

    # 2. Fetch in-memory simulated recent activities
    state = AdminWorkspaceStateStore.get_state()
    for activity in state.recent_activity:
        mapped_logs.append(
            {
                "id": activity.id,
                "title": activity.title,
                "description": activity.description,
                "timestamp": activity.timestamp,
                "type": activity.type,
                "ip_address": "127.0.0.1",
            }
        )

    # Sort all logs by timestamp descending
    # Make sure we handle datetime format during serialization or parsing
    mapped_logs.sort(key=lambda x: x["timestamp"], reverse=True)

    # Format datetimes for JSON serialization
    serialized_logs = []
    for log in mapped_logs:
        ts = log["timestamp"]
        serialized_logs.append(
            {
                "id": log["id"],
                "title": log["title"],
                "description": log["description"],
                "timestamp": ts.isoformat() if hasattr(ts, "isoformat") else str(ts),
                "type": log["type"],
                "ip_address": log["ip_address"],
            }
        )

    return success_response(
        message="Workspace audit logs retrieved",
        data=serialized_logs,
    )
