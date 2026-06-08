from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppException
from app.core.logging_config import get_logger
from app.core.responses import error_response

logger = get_logger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(message=exc.message, errors=exc.errors),
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_exception_handler(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = [
            {"loc": err["loc"], "msg": err["msg"], "type": err["type"]}
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content=error_response(message="Validation error", errors=errors),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        _: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        errors = [{"status_code": exc.status_code, "detail": str(exc.detail)}]
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(message="Request failed", errors=errors),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content=error_response(
                message="Internal server error",
                errors=[{"type": "internal_server_error"}],
            ),
        )
