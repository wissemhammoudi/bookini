from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.core.security import decode_token
from app.dependencies.auth import get_current_user
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    ConfirmPasswordResetRequest,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    RequestPasswordResetRequest,
)
from app.services.audit_log_service import AuditLogService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def _service_from_session(session: AsyncSession) -> AuthService:
    repository = UserRepository(session)
    return AuthService(repository)


def _audit_service_from_session(session: AsyncSession) -> AuditLogService:
    return AuditLogService(AuditLogRepository(session))


def _client_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


@router.post("/register")
async def register(
    payload: RegisterRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    repository = UserRepository(session)
    audit_service = _audit_service_from_session(session)

    tokens = await service.register(
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
    )

    user = await repository.get_by_email(payload.email)
    if user:
        await audit_service.record(
            user_id=user.id,
            action="REGISTER",
            ip_address=_client_ip(request),
            metadata={"email": payload.email},
        )

    return success_response(message="Registration successful", data=tokens)


@router.post("/login")
async def login(
    payload: LoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    repository = UserRepository(session)
    audit_service = _audit_service_from_session(session)

    tokens = await service.login(email=payload.email, password=payload.password)

    user = await repository.get_by_email(payload.email)
    if user:
        await audit_service.record(
            user_id=user.id,
            action="LOGIN",
            ip_address=_client_ip(request),
            metadata={"email": payload.email},
        )

    return success_response(message="Login successful", data=tokens)


@router.post("/refresh")
async def refresh_token(
    payload: RefreshTokenRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    tokens = await service.refresh_token(payload.refresh_token)
    return success_response(message="Token refresh successful", data=tokens)


@router.post("/logout")
async def logout(
    payload: LogoutRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    audit_service = _audit_service_from_session(session)

    await service.logout(payload.refresh_token)

    decoded = decode_token(payload.refresh_token)
    user_id = decoded.get("sub")
    if user_id:
        await audit_service.record(
            user_id=user_id,
            action="LOGOUT",
            ip_address=_client_ip(request),
            metadata={},
        )

    return success_response(message="Logout successful", data={})


@router.post("/password-reset/request")
async def request_password_reset(
    payload: RequestPasswordResetRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    token = await service.request_password_reset(payload.email)

    # In production this token is sent over email, not returned to clients.
    data = {"reset_token": token} if token else {}
    return success_response(
        message="If the account exists, a reset email has been sent",
        data=data,
    )


@router.post("/password-reset/confirm")
async def confirm_password_reset(
    payload: ConfirmPasswordResetRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    await service.confirm_password_reset(payload.token, payload.new_password)
    return success_response(message="Password reset successful", data={})


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    await service.change_password(
        user=current_user,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    return success_response(message="Password changed successfully", data={})
