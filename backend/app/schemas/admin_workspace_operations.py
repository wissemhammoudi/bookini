from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr

from app.schemas.admin_workspace_common import RequestStatusValue, ReservationStatusValue


class ReservationRecord(BaseModel):
    id: str
    user_id: str
    user_name: str
    place_id: str
    place_name: str
    floor_id: str
    floor_name: str
    date: str
    time: str
    status: ReservationStatusValue
    created_date: datetime


class ReservationStatusUpdateRequest(BaseModel):
    status: ReservationStatusValue


class ContactRequestRecord(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: str
    subject: str
    message: str
    date: datetime
    status: RequestStatusValue


class ContactRequestStatusUpdateRequest(BaseModel):
    status: Literal["PENDING", "PROCESSED"]
