from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, generate_latest

from app.api.v1.router import api_v1_router
from app.core.config import get_settings
from app.core.exception_handlers import register_exception_handlers
from app.core.logging_config import get_logger, setup_logging
from app.core.seed import seed_default_users
from app.infrastructure.session import get_session_factory

REQUEST_COUNT = Counter(
    "bookiwa7dek_http_requests_total",
    "Total HTTP requests processed by bookiwa7dek API",
    ["method", "path", "status_code"],
)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    logger = get_logger(__name__)
    settings = get_settings()
    
    # Initialize MinIO Bucket
    try:
        from app.infrastructure.minio_client import MinioClient
        minio_client = MinioClient()
        minio_client.ensure_bucket_exists()
        logger.info("MinIO bucket initialization complete")
    except Exception as e:
        logger.error(f"Failed to initialize MinIO bucket: {e}")

    await seed_default_users(get_session_factory(), settings)
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

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    @app.middleware("http")
    async def metrics_middleware(request, call_next):  # type: ignore[no-untyped-def]
        response = await call_next(request)
        REQUEST_COUNT.labels(
            method=request.method,
            path=request.url.path,
            status_code=str(response.status_code),
        ).inc()
        return response

    @app.get("/metrics", include_in_schema=False)
    async def metrics() -> Response:
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

    app.include_router(api_v1_router, prefix=settings.api_v1_prefix)
    app.include_router(api_v1_router, prefix="/api")

    return app


app = create_app()
