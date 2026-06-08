from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.router import api_v1_router
from app.core.config import get_settings
from app.core.exception_handlers import register_exception_handlers
from app.core.logging_config import get_logger, setup_logging


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    logger = get_logger(__name__)
    logger.info("Application startup complete")
    yield
    logger.info("Application shutdown complete")


def create_app() -> FastAPI:
    settings = get_settings()

    setup_logging(level=settings.log_level, service_name="backend")

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Production-ready Smart Floor Reservation System API",
        lifespan=lifespan,
    )

    register_exception_handlers(app)
    app.include_router(api_v1_router, prefix=settings.api_v1_prefix)

    return app


app = create_app()
