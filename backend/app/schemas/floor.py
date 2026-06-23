from uuid import UUID

from pydantic import BaseModel, Field

from app.domain.enums import FloorStatus


class FloorCreateRequest(BaseModel):
    admin_id: UUID | None = None
    name: str = Field(min_length=1, max_length=120)
    capacity: int = Field(ge=1)
    building: str = Field(min_length=1, max_length=120)
    floor_number: int
    location: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: FloorStatus = FloorStatus.AVAILABLE


class FloorUpdateRequest(BaseModel):
    admin_id: UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=120)
    capacity: int | None = Field(default=None, ge=1)
    building: str | None = Field(default=None, min_length=1, max_length=120)
    floor_number: int | None = None
    location: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: FloorStatus | None = None
