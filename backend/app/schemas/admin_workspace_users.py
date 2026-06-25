from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.admin_workspace_common import RoleValue, StatusValue


class UserRecord(BaseModel):
    id: str
    profile_image: str | None = None
    full_name: str
    email: EmailStr
    phone: str
    role: RoleValue
    status: StatusValue
    created_date: datetime
    organization_ids: list[str] = Field(default_factory=list)


class UserUpsertRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=30)
    role: RoleValue
    status: StatusValue = "ACTIVE"
    organization_ids: list[str] = Field(default_factory=list)
