import uuid

import pytest

from app.services.audit_log_service import AuditLogService


class FakeAuditLogRepository:
    def __init__(self) -> None:
        self.calls: list[dict[str, object]] = []

    async def create(
        self,
        *,
        user_id: uuid.UUID | str,
        action: str,
        ip_address: str,
        metadata: dict[str, object],
    ) -> object:
        payload = {
            "user_id": user_id,
            "action": action,
            "ip_address": ip_address,
            "metadata": metadata,
        }
        self.calls.append(payload)
        return payload


@pytest.mark.asyncio
async def test_record_persists_audit_event() -> None:
    repository = FakeAuditLogRepository()
    service = AuditLogService(repository)

    user_id = uuid.uuid4()
    await service.record(
        user_id=user_id,
        action="RESERVATION_CREATED",
        ip_address="127.0.0.1",
        metadata={"reservation_id": "r1"},
    )

    assert len(repository.calls) == 1
    payload = repository.calls[0]
    assert payload["user_id"] == user_id
    assert payload["action"] == "RESERVATION_CREATED"
    assert payload["ip_address"] == "127.0.0.1"
    assert payload["metadata"] == {"reservation_id": "r1"}
