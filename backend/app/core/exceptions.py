from typing import Any


class AppException(Exception):
    def __init__(
        self,
        status_code: int,
        message: str,
        errors: list[dict[str, Any]] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.errors = errors or []


class ValidationException(AppException):
    def __init__(
        self,
        message: str = "Validation error",
        errors: list[dict[str, Any]] | None = None,
    ) -> None:
        super().__init__(status_code=422, message=message, errors=errors)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(status_code=404, message=message)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized") -> None:
        super().__init__(status_code=401, message=message)
