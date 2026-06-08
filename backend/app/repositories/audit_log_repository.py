import uuid
from typing import Any

from sqlalchemy import Select, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditLogRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        *,
        user_id: uuid.UUID | str,
        action: str,
        ip_address: str,
        metadata: dict[str, Any],
    ) -> AuditLog:
        parsed_user_id = (
            user_id if isinstance(user_id, uuid.UUID) else uuid.UUID(user_id)
        )
        log = AuditLog(
            user_id=parsed_user_id,
            action=action,
            ip_address=ip_address,
            metadata_payload=metadata,
        )
        self._session.add(log)
        await self._session.commit()
        await self._session.refresh(log)
        return log

    async def list_recent(self, limit: int = 50) -> list[AuditLog]:
        statement: Select[tuple[AuditLog]] = (
            select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit)
        )
        result = await self._session.execute(statement)
        return list(result.scalars().all())
