from fastapi import APIRouter

from app.presentation.health_routes import router as health_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
