from collections.abc import Callable

from fastapi import Depends

from app.core.exceptions import ForbiddenException
from app.dependencies.auth import get_current_user
from app.models.user import User


def require_roles(allowed_roles: list[str]) -> Callable[[User], User]:
    async def _role_guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles:
            raise ForbiddenException("Insufficient permissions for this operation")
        return current_user

    return _role_guard
