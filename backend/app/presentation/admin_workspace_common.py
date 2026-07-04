from typing import Annotated

from fastapi import Depends

from app.dependencies.rbac import require_roles
from app.models.user import User

AdminAccessUser = Annotated[
    User,
    Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
]

SuperAdminAccessUser = Annotated[
    User,
    Depends(require_roles(["SUPER_ADMIN"])),
]
