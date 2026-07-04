from __future__ import annotations

from copy import deepcopy
from threading import Lock
from uuid import uuid4

from app.schemas.admin_workspace import RecentActivityItem
from app.services.admin_workspace_seed import (
    WorkspaceState,
    build_workspace_state,
    utc_now,
)


class AdminWorkspaceStateStore:
    _lock = Lock()
    _state: WorkspaceState | None = None
    _floor_reviews: dict[str, list[dict]] = {}

    @classmethod
    def get_state(cls) -> WorkspaceState:
        with cls._lock:
            if cls._state is None:
                cls._state = build_workspace_state()
            return cls._state

    @classmethod
    def get_floor_reviews(cls, floor_id: str) -> list[dict]:
        with cls._lock:
            if floor_id not in cls._floor_reviews:
                cls._floor_reviews[floor_id] = []
            return cls._floor_reviews[floor_id]

    @classmethod
    def upsert_floor_review(
        cls,
        floor_id: str,
        user_id: str,
        rating: int,
        comment: str | None,
        user_name: str,
    ) -> dict:
        with cls._lock:
            if floor_id not in cls._floor_reviews:
                cls._floor_reviews[floor_id] = []

            # Find if user already reviewed
            existing = next(
                (r for r in cls._floor_reviews[floor_id] if r["user_id"] == user_id),
                None,
            )
            now = utc_now().isoformat()
            if existing:
                existing["rating"] = rating
                existing["comment"] = comment
                existing["updated_at"] = now
                return existing

            new_review = {
                "id": f"review-{uuid4().hex[:10]}",
                "floor_id": floor_id,
                "user_id": user_id,
                "rating": rating,
                "comment": comment,
                "user_name": user_name,
                "created_at": now,
                "updated_at": now,
            }
            cls._floor_reviews[floor_id].append(new_review)
            return new_review

    @classmethod
    def delete_floor_review(cls, floor_id: str, user_id: str) -> bool:
        with cls._lock:
            if floor_id in cls._floor_reviews:
                initial_len = len(cls._floor_reviews[floor_id])
                cls._floor_reviews[floor_id] = [
                    r for r in cls._floor_reviews[floor_id] if r["user_id"] != user_id
                ]
                return len(cls._floor_reviews[floor_id]) < initial_len
            return False

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
        state.recent_activity = state.recent_activity[:200]
