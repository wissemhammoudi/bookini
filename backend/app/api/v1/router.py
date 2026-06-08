from fastapi import APIRouter

from app.presentation.activity_routes import router as activity_router
from app.presentation.admin_routes import router as admin_router
from app.presentation.auth_routes import router as auth_router
from app.presentation.floor_routes import router as floor_router
from app.presentation.health_routes import router as health_router
from app.presentation.reservation_routes import router as reservation_router
from app.presentation.statistics_routes import router as statistics_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(floor_router)
api_v1_router.include_router(reservation_router)
api_v1_router.include_router(activity_router)
api_v1_router.include_router(statistics_router)
