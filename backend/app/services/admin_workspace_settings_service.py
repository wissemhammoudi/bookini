from __future__ import annotations

from app.schemas.admin_workspace import SettingsRecord, SettingsUpdateRequest
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspaceSettingsService:
    @staticmethod
    def update_settings(payload: SettingsUpdateRequest) -> SettingsRecord:
        state = AdminWorkspaceStateStore.get_state()
        state.settings = SettingsRecord(**payload.model_dump())
        AdminWorkspaceStateStore.record_activity(
            state.settings.profile.full_name,
            "Settings were updated.",
            "user",
        )
        return state.settings
