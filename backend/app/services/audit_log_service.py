import uuid
from typing import Any

from app.repositories.audit_log_repository import AuditLogRepository


class AuditLogService:
    def __init__(self, repository: AuditLogRepository) -> None:
        self._repository = repository

    async def record(
        self,
        *,
        user_id: uuid.UUID | str,
        action: str,
        ip_address: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        await self._repository.create(
            user_id=user_id,
            action=action,
            ip_address=ip_address,
            metadata=metadata or {},
        )
