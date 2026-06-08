from datetime import datetime

from pydantic import BaseModel, Field


class ReservationCreateRequest(BaseModel):
    floor_id: str = Field(min_length=1)
    start_time: datetime
    end_time: datetime


class ReservationCancelRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=255)
