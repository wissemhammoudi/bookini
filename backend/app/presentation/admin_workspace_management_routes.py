from fastapi import APIRouter, Response

from app.core.responses import success_response
from app.presentation.admin_workspace_common import (
    AdminAccessUser,
    SuperAdminAccessUser,
)
from app.schemas.admin_workspace import (
    FloorUpsertRequest,
    OrganizationUpsertRequest,
    PlaceUpsertRequest,
    ReservationStatusUpdateRequest,
    SettingsUpdateRequest,
    UserUpsertRequest,
)
from app.services.admin_workspace_organization_service import (
    AdminWorkspaceOrganizationService,
)
from app.services.admin_workspace_reservation_service import (
    AdminWorkspaceReservationService,
)
from app.services.admin_workspace_user_service import AdminWorkspaceUserService

router = APIRouter(tags=["admin"])


@router.post("/workspace/users")
async def create_user(
    payload: UserUpsertRequest,
    _: SuperAdminAccessUser,
) -> dict[str, object]:
    user = AdminWorkspaceUserService.create_user(payload)
    return success_response(message="User created", data=user.model_dump(mode="json"))


@router.put("/workspace/users/{user_id}")
async def update_user(
    user_id: str,
    payload: UserUpsertRequest,
    _: SuperAdminAccessUser,
) -> dict[str, object]:
    user = AdminWorkspaceUserService.update_user(user_id, payload)
    return success_response(message="User updated", data=user.model_dump(mode="json"))


@router.patch("/workspace/users/{user_id}/status/{status_value}")
async def update_user_status(
    user_id: str,
    status_value: str,
    _: SuperAdminAccessUser,
) -> dict[str, object]:
    user = AdminWorkspaceUserService.set_user_status(user_id, status_value.upper())
    return success_response(
        message="User status updated", data=user.model_dump(mode="json")
    )


@router.delete("/workspace/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    _: SuperAdminAccessUser,
) -> Response:
    AdminWorkspaceUserService.delete_user(user_id)
    return Response(status_code=204)


@router.post("/workspace/organizations")
async def create_organization(
    payload: OrganizationUpsertRequest,
    _: SuperAdminAccessUser,
) -> dict[str, object]:
    organization = AdminWorkspaceOrganizationService.create_organization(payload)
    return success_response(
        message="Organization created",
        data=organization.model_dump(mode="json"),
    )


@router.put("/workspace/organizations/{organization_id}")
async def update_organization(
    organization_id: str,
    payload: OrganizationUpsertRequest,
    _: AdminAccessUser,
) -> dict[str, object]:
    organization = AdminWorkspaceOrganizationService.update_organization(
        organization_id, payload
    )
    return success_response(
        message="Organization updated",
        data=organization.model_dump(mode="json"),
    )


@router.patch("/workspace/organizations/{organization_id}/status/{status_value}")
async def update_organization_status(
    organization_id: str,
    status_value: str,
    _: SuperAdminAccessUser,
) -> dict[str, object]:
    organization = AdminWorkspaceOrganizationService.set_organization_status(
        organization_id,
        status_value.upper(),
    )
    return success_response(
        message="Organization status updated",
        data=organization.model_dump(mode="json"),
    )


@router.delete("/workspace/organizations/{organization_id}", status_code=204)
async def delete_organization(
    organization_id: str,
    _: SuperAdminAccessUser,
) -> Response:
    AdminWorkspaceOrganizationService.delete_organization(organization_id)
    return Response(status_code=204)


@router.post("/workspace/places")
async def create_place(
    payload: PlaceUpsertRequest,
    _: AdminAccessUser,
) -> dict[str, object]:
    place = AdminWorkspaceOrganizationService.create_place(payload)
    return success_response(message="Place created", data=place.model_dump(mode="json"))


@router.put("/workspace/places/{place_id}")
async def update_place(
    place_id: str,
    payload: PlaceUpsertRequest,
    _: AdminAccessUser,
) -> dict[str, object]:
    place = AdminWorkspaceOrganizationService.update_place(place_id, payload)
    return success_response(message="Place updated", data=place.model_dump(mode="json"))


@router.delete("/workspace/places/{place_id}", status_code=204)
async def delete_place(
    place_id: str,
    _: AdminAccessUser,
) -> Response:
    AdminWorkspaceOrganizationService.delete_place(place_id)
    return Response(status_code=204)


@router.post("/workspace/floors")
async def create_floor(
    payload: FloorUpsertRequest,
    _: AdminAccessUser,
) -> dict[str, object]:
    floor = AdminWorkspaceOrganizationService.create_floor(payload)
    return success_response(message="Floor created", data=floor.model_dump(mode="json"))


@router.put("/workspace/floors/{floor_id}")
async def update_floor(
    floor_id: str,
    payload: FloorUpsertRequest,
    _: AdminAccessUser,
) -> dict[str, object]:
    floor = AdminWorkspaceOrganizationService.update_floor(floor_id, payload)
    return success_response(message="Floor updated", data=floor.model_dump(mode="json"))


@router.delete("/workspace/floors/{floor_id}", status_code=204)
async def delete_floor(
    floor_id: str,
    _: AdminAccessUser,
) -> Response:
    AdminWorkspaceOrganizationService.delete_floor(floor_id)
    return Response(status_code=204)


@router.patch("/workspace/reservations/{reservation_id}")
async def update_reservation_status(
    reservation_id: str,
    payload: ReservationStatusUpdateRequest,
    _: AdminAccessUser,
) -> dict[str, object]:
    reservation = AdminWorkspaceReservationService.update_reservation_status(
        reservation_id,
        payload.status,
    )
    return success_response(
        message="Reservation updated",
        data=reservation.model_dump(mode="json"),
    )


@router.put("/workspace/settings")
async def update_settings(
    payload: SettingsUpdateRequest,
    _: AdminAccessUser,
) -> dict[str, object]:
    settings = AdminWorkspaceOrganizationService.update_settings(payload)
    return success_response(
        message="Settings updated", data=settings.model_dump(mode="json")
    )
