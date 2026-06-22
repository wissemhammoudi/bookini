from __future__ import annotations

from copy import deepcopy
from threading import Lock
from uuid import uuid4

from app.schemas.admin_workspace import RecentActivityItem
from app.services.admin_workspace_seed import WorkspaceState, build_workspace_state, utc_now


class AdminWorkspaceStateStore:
    _lock = Lock()
    _state: WorkspaceState | None = None

    @classmethod
    def get_state(cls) -> WorkspaceState:
        with cls._lock:
            if cls._state is None:
                cls._state = build_workspace_state()
            return cls._state

    @classmethod
    def copy_state(cls) -> WorkspaceState:
        return deepcopy(cls.get_state())

    @classmethod
    def record_activity(
        cls,
        title: str,
        description: str,
        item_type: str,
    ) -> None:
        state = cls.get_state()
        state.recent_activity.insert(
            0,
            RecentActivityItem(
                id=f"activity-{uuid4().hex[:10]}",
                title=title,
                description=description,
                timestamp=utc_now(),
                type=item_type,
            ),
        )
        state.recent_activity = state.recent_activity[:10]
