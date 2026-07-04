from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, HttpUrl

from app.schemas.admin_workspace_common import (
    AvailabilitySlot,
    ReservationAreaRecord,
    StatusValue,
)


class OrganizationRecord(BaseModel):
    id: str
    logo: str | None = None
    cover_image: str | None = None
    name: str
    description: str
    address: str
    contact_email: EmailStr
    contact_phone: str
    website: HttpUrl | None = None
    social_links: list[HttpUrl] = Field(default_factory=list)
    status: StatusValue
    created_date: datetime


class OrganizationUpsertRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=10, max_length=600)
    address: str = Field(min_length=5, max_length=255)
    contact_email: EmailStr
    contact_phone: str = Field(min_length=6, max_length=30)
    website: HttpUrl | None = None
    logo: str | None = None
    cover_image: str | None = None
    social_links: list[HttpUrl] = Field(default_factory=list)
    status: StatusValue = "ACTIVE"


class PlaceRecord(BaseModel):
    id: str
    organization_id: str
    name: str
    description: str
    category: str
    capacity: int
    address: str
    pricing: float
    availability: list[AvailabilitySlot] = Field(default_factory=list)
    cover_image: str | None = None
    gallery: list[str] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    status: StatusValue
    created_date: datetime


class PlaceUpsertRequest(BaseModel):
    organization_id: str
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=10, max_length=600)
    category: str = Field(min_length=2, max_length=80)
    capacity: int = Field(ge=1, le=5000)
    address: str = Field(min_length=5, max_length=255)
    pricing: float = Field(ge=0)
    availability: list[AvailabilitySlot] = Field(min_length=1)
    cover_image: str | None = None
    gallery: list[str] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    status: StatusValue = "ACTIVE"


class FloorRecord(BaseModel):
    id: str
    place_id: str
    floor_name: str
    floor_number: int
    floor_size_sqm: float = Field(ge=1, default=100)
    floor_shape: Literal["SQUARE", "RECTANGLE", "L_SHAPE", "CUSTOM_POLYGON"] = (
        "RECTANGLE"
    )
    capacity: int
    pricing: float = Field(ge=0)
    description: str
    blueprint_image: str | None = None
    reservation_areas: list[str | ReservationAreaRecord] = Field(default_factory=list)
    status: StatusValue
    created_date: datetime


class FloorUpsertRequest(BaseModel):
    place_id: str
    floor_name: str = Field(min_length=2, max_length=120)
    floor_number: int = Field(ge=0, le=200)
    floor_size_sqm: float = Field(ge=1, le=100000, default=100)
    floor_shape: Literal["SQUARE", "RECTANGLE", "L_SHAPE", "CUSTOM_POLYGON"] = (
        "RECTANGLE"
    )
    capacity: int = Field(ge=1, le=5000)
    pricing: float = Field(ge=0)
    description: str = Field(min_length=5, max_length=400)
    blueprint_image: str | None = None
    reservation_areas: list[str | ReservationAreaRecord] = Field(default_factory=list)
    status: StatusValue = "ACTIVE"
