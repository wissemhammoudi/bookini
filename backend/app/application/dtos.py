from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class ApiEnvelope:
    success: bool
    message: str
    payload: Any
