from __future__ import annotations

from fastapi import HTTPException, status

from app.schemas.admin_workspace import UserRecord, UserUpsertRequest
from app.services.admin_workspace_seed import utc_now
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspaceUserService:
    @staticmethod
    def create_user(payload: UserUpsertRequest) -> UserRecord:
        state = AdminWorkspaceStateStore.get_state()
        user = UserRecord(
            id=f"user-{utc_now().strftime('%H%M%S%f')[-8:]}",
            profile_image=None,
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            role=payload.role,
            status=payload.status,
            organization_ids=payload.organization_ids,
            created_date=utc_now(),
        )
        state.users.insert(0, user)
        AdminWorkspaceStateStore.record_activity(
            user.full_name,
            f"User {user.email} was created.",
            "user",
        )
        return user

    @staticmethod
    def update_user(user_id: str, payload: UserUpsertRequest) -> UserRecord:
        state = AdminWorkspaceStateStore.get_state()
        for index, user in enumerate(state.users):
            if user.id == user_id:
                updated = user.model_copy(
                    update={
                        "full_name": payload.full_name,
                        "email": payload.email,
                        "phone": payload.phone,
                        "role": payload.role,
                        "status": payload.status,
                        "organization_ids": payload.organization_ids,
                    }
                )
                state.users[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.full_name,
                    "User record was updated.",
                    "user",
                )
                return updated
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    @staticmethod
    def delete_user(user_id: str) -> None:
        state = AdminWorkspaceStateStore.get_state()
        previous_count = len(state.users)
        state.users = [user for user in state.users if user.id != user_id]
        if len(state.users) == previous_count:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        AdminWorkspaceStateStore.record_activity(
            "User deleted",
            f"User {user_id} was removed.",
            "user",
        )

    @staticmethod
    def set_user_status(user_id: str, status_value: str) -> UserRecord:
        state = AdminWorkspaceStateStore.get_state()
        for index, user in enumerate(state.users):
            if user.id == user_id:
                updated = user.model_copy(update={"status": status_value})
                state.users[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.full_name,
                    f"User status set to {status_value}.",
                    "user",
                )
                return updated
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
