from pydantic import BaseModel, EmailStr

from app.domain.enums import UserRole


class AdminRoleUpdateRequest(BaseModel):
    email: EmailStr
    role: UserRole
