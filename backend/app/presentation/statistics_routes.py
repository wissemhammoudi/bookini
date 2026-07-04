import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.dependencies.rbac import require_roles
from app.infrastructure.redis_client import get_redis
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.repositories.analytics_repository import AnalyticsRepository
from app.services.occupancy_service import OccupancyService
from app.services.statistics_service import StatisticsService

router = APIRouter(prefix="/statistics", tags=["statistics"])


def _analytics_repository(session: AsyncSession) -> AnalyticsRepository:
    return AnalyticsRepository(session)


@router.get("/occupancy")
async def occupancy_metrics(
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = OccupancyService(_analytics_repository(session))
    data = await service.occupancy_metrics()
    return success_response(message="Occupancy metrics retrieved", data=data)


@router.get("/summary")
async def statistics_summary(
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
    redis: aioredis.Redis = Depends(get_redis),
) -> dict[str, object]:
    service = StatisticsService(_analytics_repository(session), redis)
    data = await service.summary_metrics()
    return success_response(message="Statistics summary retrieved", data=data)


@router.get("/most-reserved-rooms")
async def most_reserved_rooms(
    limit: int = Query(default=5, ge=1, le=20),
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
    redis: aioredis.Redis = Depends(get_redis),
) -> dict[str, object]:
    service = StatisticsService(_analytics_repository(session), redis)
    data = await service.most_reserved_rooms(limit=limit)
    return success_response(message="Most reserved rooms retrieved", data=data)


@router.get("/peak-hours")
async def peak_hours(
    limit: int = Query(default=6, ge=1, le=24),
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
    redis: aioredis.Redis = Depends(get_redis),
) -> dict[str, object]:
    service = StatisticsService(_analytics_repository(session), redis)
    data = await service.peak_hours(limit=limit)
    return success_response(message="Peak reservation hours retrieved", data=data)
