from collections.abc import Callable

from fastapi import Depends

from app.core.exceptions import ForbiddenException
from app.dependencies.auth import get_current_user
from app.models.user import User


def require_roles(allowed_roles: list[str]) -> Callable[[User], User]:
    allowed = {role.upper() for role in allowed_roles}

    async def _role_guard(current_user: User = Depends(get_current_user)) -> User:
        raw_role = getattr(current_user, "role", None)
        role_value = getattr(raw_role, "value", raw_role)
        normalized_role = str(role_value).upper() if role_value is not None else ""

        if normalized_role not in allowed:
            raise ForbiddenException("Insufficient permissions for this operation")
        return current_user

    return _role_guard
