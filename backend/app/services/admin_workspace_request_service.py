from __future__ import annotations

from fastapi import HTTPException, status

from app.schemas.admin_workspace import ContactRequestRecord, PartnershipRequestRecord
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore


class AdminWorkspaceRequestService:
    @staticmethod
    def update_contact_status(
        request_id: str, status_value: str
    ) -> ContactRequestRecord:
        state = AdminWorkspaceStateStore.get_state()
        for index, contact in enumerate(state.contact_requests):
            if contact.id == request_id:
                updated = contact.model_copy(update={"status": status_value})
                state.contact_requests[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.full_name,
                    f"Contact request marked {status_value.lower()}.",
                    "contact",
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contact request not found"
        )

    @staticmethod
    def delete_contact(request_id: str) -> None:
        state = AdminWorkspaceStateStore.get_state()
        previous = len(state.contact_requests)
        state.contact_requests = [
            item for item in state.contact_requests if item.id != request_id
        ]
        if len(state.contact_requests) == previous:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact request not found",
            )
        AdminWorkspaceStateStore.record_activity(
            "Contact request deleted",
            f"Request {request_id} was removed.",
            "contact",
        )

    @staticmethod
    def update_partnership_status(
        request_id: str,
        status_value: str,
    ) -> PartnershipRequestRecord:
        from datetime import UTC, datetime

        state = AdminWorkspaceStateStore.get_state()
        for index, request in enumerate(state.partnership_requests):
            if request.id == request_id:
                generated_credentials = request.generated_credentials
                if status_value == "APPROVED" and request.status != "APPROVED":
                    email_prefix = request.company_name.lower().replace(" ", "")[:12]
                    generated_email = f"admin@{email_prefix}.com"
                    company_clean = (
                        request.company_name.split()[0]
                        if request.company_name.split()
                        else "partner"
                    )
                    temp_password = f"{company_clean}2026!"
                    generated_credentials = {
                        "email": generated_email,
                        "temporary_password": temp_password,
                    }

                    # Create simulated organization
                    org_id = f"org-{email_prefix}"
                    if not any(org.id == org_id for org in state.organizations):
                        from app.schemas.admin_workspace import OrganizationRecord

                        new_org = OrganizationRecord(
                            id=org_id,
                            logo=None,
                            cover_image=None,
                            name=request.company_name,
                            description=request.business_description,
                            address="Tunis, Tunisia",
                            contact_email=request.email,
                            contact_phone=request.phone,
                            website=None,
                            social_links=[],
                            status="ACTIVE",
                            created_date=datetime.now(UTC),
                        )
                        state.organizations.append(new_org)

                    # Create simulated admin user
                    user_id = f"user-{email_prefix}"
                    if not any(user.id == user_id for user in state.users):
                        from app.schemas.admin_workspace import UserRecord

                        new_user = UserRecord(
                            id=user_id,
                            profile_image=None,
                            full_name=request.contact_person,
                            email=generated_email,
                            phone=request.phone,
                            role="ADMIN",
                            status="ACTIVE",
                            created_date=datetime.now(UTC),
                            organization_id=org_id,
                        )
                        state.users.append(new_user)
                        AdminWorkspaceStateStore.record_activity(
                            new_user.full_name,
                            f"Admin account created for {request.company_name}.",
                            "user",
                        )

                updated = request.model_copy(
                    update={
                        "status": status_value,
                        "generated_credentials": generated_credentials,
                    }
                )
                state.partnership_requests[index] = updated
                AdminWorkspaceStateStore.record_activity(
                    updated.company_name,
                    f"Partnership request {status_value.lower()}.",
                    "partnership",
                )
                return updated
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partnership request not found",
        )
