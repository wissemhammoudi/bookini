from fastapi import APIRouter, Depends, File, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    ConfirmPasswordResetRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    RequestPasswordResetRequest,
    UpdateProfileRequest,
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


def _user_profile_response(user: User) -> dict[str, object]:
    avatar_url = user.avatar_url
    if avatar_url and getattr(user, "updated_at", None):
        avatar_url = f"{avatar_url}?t={int(user.updated_at.timestamp())}"
    return {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "avatar_url": avatar_url,
    }


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


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    return success_response(
        message="Profile retrieved successfully",
        data=_user_profile_response(current_user),
    )


@router.put("/profile")
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    updated_user = await service.update_profile(
        user=current_user,
        full_name=payload.full_name,
        email=payload.email,
    )
    return success_response(
        message="Profile updated successfully",
        data=_user_profile_response(updated_user),
    )


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    if file is None:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=400,
            detail="No file provided. Use multipart/form-data with field name 'file'.",
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    import os

    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    if not file_ext:
        file_ext = ".jpg"
    object_name = f"avatars/{current_user.id}{file_ext}"

    file_data = await file.read()
    from app.infrastructure.minio_client import MinioClient

    minio_client = MinioClient()
    minio_client.upload_file(
        file_data=file_data, object_name=object_name, content_type=file.content_type
    )

    avatar_url = f"/api/v1/auth/uploads/{object_name}"
    service = _service_from_session(session)
    updated_user = await service.update_avatar(user=current_user, avatar_url=avatar_url)

    return success_response(
        message="Avatar uploaded successfully",
        data=_user_profile_response(updated_user),
    )


@router.post("/upload")
async def upload_file(
    file: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    if file is None:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=400,
            detail="No file provided. Use multipart/form-data with field name 'file'.",
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    import os
    import uuid

    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    if not file_ext:
        file_ext = ".jpg"
    object_name = f"{uuid.uuid4()}{file_ext}"

    file_data = await file.read()
    from app.infrastructure.minio_client import MinioClient

    minio_client = MinioClient()
    minio_client.upload_file(
        file_data=file_data, object_name=object_name, content_type=file.content_type
    )

    file_url = f"/api/v1/auth/uploads/{object_name}"
    return success_response(
        message="File uploaded successfully",
        data={"url": file_url},
    )


@router.get("/uploads/{filename:path}")
async def get_upload(filename: str):
    import io

    from fastapi.responses import StreamingResponse

    from app.infrastructure.minio_client import MinioClient

    minio_client = MinioClient()
    try:
        file_bytes = minio_client.get_file(filename)
        content_type = "image/jpeg"
        if filename.endswith(".png"):
            content_type = "image/png"
        elif filename.endswith(".gif"):
            content_type = "image/gif"
        elif filename.endswith(".webp"):
            content_type = "image/webp"
        elif filename.endswith(".svg"):
            content_type = "image/svg+xml"
        elif filename.endswith(".mp4"):
            content_type = "video/mp4"

        return StreamingResponse(io.BytesIO(file_bytes), media_type=content_type)
    except Exception:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="File not found")
